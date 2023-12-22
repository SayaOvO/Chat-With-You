import { db } from "@/lib/db";
import { formatLastestMessageTime } from "@/lib/format-time";
import { direct_messages } from "@/lib/schema";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is missing" },
        { status: 400 }
      );
    }

    const message = await db.query.direct_messages.findFirst({
      where: eq(direct_messages.conversationId, conversationId),
      orderBy: desc(direct_messages.id),
    });
    if (message) {
      return NextResponse.json({
        content: message.content,
        time: formatLastestMessageTime(message.createdAt),
      });
    } else {
      return new NextResponse();
    }
  } catch (error) {
    console.log("[GET_LATEST_MESSAGE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
