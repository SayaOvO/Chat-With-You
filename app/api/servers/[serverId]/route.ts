import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { servers } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { name, imageUrl } = await req.json();

    if (!name) {
      return new NextResponse("Name is missing", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Name is missing", { status: 400 });
    }

    const [updatedServer] = await db
      .update(servers)
      .set({
        name,
        imageUrl,
      })
      .where(eq(servers.id, params.serverId))
      .returning();

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("PATCH SERVERID", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { serverId } = params;
    if (!serverId) {
      return new NextResponse("Server ID is missing.");
    }
    await db
      .delete(servers)
      .where(and(eq(servers.id, serverId), eq(servers.profileId, profile.id)));

    return new NextResponse("Accepted", { status: 202 });
  } catch (error) {
    console.log("[DELETE MEMBER ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
