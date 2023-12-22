import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { servers } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  _req: Request,
  { params }: { params: { serverId: string } }
) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const [updatedServer] = await db
      .update(servers)
      .set({ inviteCode: uuid() })
      .where(eq(servers.id, params.serverId))
      .returning();

    return NextResponse.json(updatedServer);
  } catch (error) {
    console.log("[PATCH_SERVER_INVITE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
