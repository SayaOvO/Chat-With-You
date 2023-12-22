import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/query";
import { channels } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  {
    params,
  }: {
    params: { channelId: string };
  }
) {
  try {
    const profile = await currentProfile();
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");
    const { name, type } = await req.json();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!serverId) {
      return new NextResponse("Server ID is missing", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is missing", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Channel type is missing", { status: 400 });
    }

    if (name === "general") {
      return new NextResponse("name cannot be general", { status: 400 });
    }
    const canEdit = await hasPermission(profile.id, serverId);

    if (!canEdit) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [updatedChannel] = await db
      .update(channels)
      .set({
        name,
        type,
      })
      .where(eq(channels.id, params.channelId))
      .returning();

    return NextResponse.json(updatedChannel);
  } catch (error) {
    console.log("[PATCH_CHANNEL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { channelId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");

    if (!serverId) {
      return new NextResponse("Server ID is missing", { status: 401 });
    }

    const canDelete = await hasPermission(profile.id, serverId);

    if (!canDelete) {
      return new NextResponse("Forbidden", { status: 403 });
    }
    await db.delete(channels).where(eq(channels.id, params.channelId));

    return new NextResponse("Accepted", { status: 202 });
  } catch (error) {
    console.log("[DELETE_CHANNEL]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}