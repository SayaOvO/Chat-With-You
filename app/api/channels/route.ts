import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/query";
import { channels } from "@/lib/schema";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const { name, type } = await req.json();
    const searchParams = req.nextUrl.searchParams;
    const serverId = searchParams.get("serverId");

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is missing", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Type is missing", { status: 400 });
    }

    if (!serverId) {
      return new NextResponse("Server ID is missing", { status: 400 });
    }
    const canCreate = await hasPermission(profile.id, serverId);

    if (!canCreate) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const [newChannel] = await db
      .insert(channels)
      .values({
        name,
        type,
        serverId: serverId,
      })
      .returning();

    return NextResponse.json(newChannel);

  } catch (error) {
    console.log("POST CHANNELS", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}