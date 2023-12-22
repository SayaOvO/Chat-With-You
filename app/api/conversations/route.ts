import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const profile = await currentProfile();
    if (!profile) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
        }
      );
    }

    const allConversations = await db.query.conversations.findMany({
      where: or(
        eq(conversations.userOneId, profile.id),
        eq(conversations.userTwoId, profile.id)
      ),
      with: {
        userOne: true,
        userTwo: true,
      },
    });
    return NextResponse.json(allConversations);
  } catch (error) {
    console.log("[GET_ALL_CONVERSATIONS", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
      }
    );
  }
}
