import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { direct_messages } from "@/lib/schema";
import { and, desc, eq, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const LIMIT = 10;

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const conversationId = searchParams.get("conversationId");

    if (!profile) {
      return NextResponse.json({ error: "Unthorized" }, { status: 401 });
    }

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is missing" },
        { status: 401 }
      );
    }
    let messages: any[];

    if (cursor) {
      messages = await db.transaction(async (ctx) => {
        const [message] = await ctx
          .select()
          .from(direct_messages)
          .where(and(eq(direct_messages.id, +cursor)));

        messages = await ctx.query.direct_messages.findMany({
          where: and(
            lte(direct_messages.id, message.id),
            eq(direct_messages.conversationId, conversationId)
          ),
          with: {
            conversation: {
              with: {
                userOne: true,
                userTwo: true,
              },
            },
            sender: true,
            repliedMessage: {
              columns: { content: true },
              with: {
                sender: {
                  columns: {
                    imageUrl: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: desc(direct_messages.id),
          limit: LIMIT + 1,
        });
        return messages;
      });
    } else {
      messages = await db.query.direct_messages.findMany({
        where: eq(direct_messages.conversationId, conversationId),
        with: {
          conversation: {
            with: {
              userOne: true,
              userTwo: true,
            },
          },
          sender: true,
          repliedMessage: {
            columns: { content: true},
            with: {
              sender: true,
            },
          },
        },
        orderBy: desc(direct_messages.id),
        limit: LIMIT + 1,
      });
    }

    // messages = messages.map((message) => ({
    //   ...message,
    //   repliedMessage: {
    //     content: message.repliedMessage.content,
    //     imageUrl: message.repliedMessage.sender.imageUrl,
    //     name: message.repliedMessage.sender.name,
    //   },
    // }));
    return NextResponse.json({
      messages: messages.slice(0, LIMIT),
      nextCursor: messages.length === LIMIT + 1 ? messages[LIMIT].id : null,
    });
  } catch (error) {
    console.log("[DMS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
