import { v4 as uuid } from "uuid";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { channels, members, servers } from "@/lib/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const profile = await currentProfile();

    if (!profile) {
      return new Response("Unauthorized", { status: 401 });
    }
    const { imageUrl, name } = await req.json();

    if (!imageUrl) {
      return new Response("Image URL is missing", { status: 400 });
    }

    if (!name) {
      return new Response("Name is missing", { status: 400 });
    }

    const server = await db.transaction(async (ctx) => {
      const [newServer] = await ctx
        .insert(servers)
        .values({
          name,
          inviteCode: uuid(),
          profileId: profile.id,
          imageUrl,
        })
        .returning();

      await ctx.insert(channels).values({
        serverId: newServer.id,
        name: "general",
      });
      await ctx.insert(members).values({
        profileId: profile.id,
        serverId: newServer.id,
        memberRole: "owner",
      });
      return newServer;
    });
    return NextResponse.json(server);
  } catch (error) {
    console.log("[POST_SERVERS]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
