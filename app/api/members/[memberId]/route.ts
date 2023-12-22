import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getServerWithChannelsAndMembers } from "@/lib/query";
import { members, servers } from "@/lib/schema";
import { and, eq, not } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");

    const { role } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!role) {
      return new NextResponse("Role is missing.", { status: 400 });
    }
    if (!serverId) {
      return new NextResponse("Server ID is missing.", { status: 400 });
    }
    const server = await db.transaction(async (ctx) => {
      await ctx
        .update(members)
        .set({
          memberRole: role,
        })
        .where(
          and(
            eq(members.id, params.memberId),
            not(eq(members.profileId, profile.id))
          )
        );
      const server = ctx.query.servers.findFirst({
        where: eq(servers.id, serverId),
        with: {
          channels: true,
          members: {
            with: {
              profile: true,
            },
          },
        },
      });
      return server;
    });

    return NextResponse.json(server);
  } catch (error) {
    console.log("[PATCH MEMBER]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Need to be rechecked
export async function DELETE(
  req: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const profile = await currentProfile();
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    if (!serverId) {
      return new NextResponse("Server ID is missing", { status: 400 });
    }
    const operator = await db.query.members.findFirst({
      where: and(
        eq(members.profileId, profile.id),
        eq(members.serverId, serverId)
      ),
    });
    if (!operator) {
      return new NextResponse("Forbidden", { status: 404 });
    }
    const role = operator.memberRole;
    if (role === "owner") {
      await db
        .delete(members)
        .where(
          and(
            eq(members.id, params.memberId),
            eq(members.serverId, serverId),
            not(eq(members.memberRole, "owner"))
          )
        );
    } else if (role === "moderator" && operator.id !== params.memberId) {
      await db
        .delete(members)
        .where(
          and(
            eq(members.id, params.memberId),
            eq(members.serverId, serverId),
            not(eq(members.memberRole, "owner")),
            not(eq(members.memberRole, "moderator"))
          )
        );
    } else if (operator.id === params.memberId) {
      await db
        .delete(members)
        .where(
          and(
            eq(members.id, params.memberId),
            eq(members.serverId, serverId),
            not(eq(members.memberRole, "owner"))
          )
        );
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
    // return updated server
    const updatedServer = await getServerWithChannelsAndMembers(serverId);
    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("DELETE MEMBER", { status: 500 });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
