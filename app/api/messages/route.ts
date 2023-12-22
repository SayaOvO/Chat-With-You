import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { channel_messages } from "@/lib/schema";
import { ChannelMessageWithMemberAndProfile } from "@/types";
import { and, desc, eq, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

const LIMIT = 10;

export async function GET(req: NextRequest) {
  try {
    const profile = await currentProfile();
    const searchParams = req.nextUrl.searchParams;
    const cursor = searchParams.get("cursor");
    const channelId = searchParams.get("channelId");

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!channelId) {
      return NextResponse.json(
        { error: "Channel is missing" },
        { status: 400 }
      );
    }

    let messages: any[];

    if (cursor) {
      messages = await db.transaction(async (ctx) => {
        const [message] = await ctx
          .select()
          .from(channel_messages)
          .where(
            and(
              eq(channel_messages.id, +cursor),
              eq(channel_messages.isDeleted, false)
            )
          );

        messages = await ctx.query.channel_messages.findMany({
          where: and(
            lte(channel_messages.id, message.id),
            eq(channel_messages.channelId, channelId),
            eq(channel_messages.isDeleted, false)
          ),
          with: {
            member: {
              with: {
                profile: true,
              },
            },

          repliedMessage: {
            columns: {
              content: true,
            },
            with: {
              member: {
                columns: {},
                with: {
                  profile: {
                    columns: {
                      imageUrl: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },

          },

          orderBy: desc(channel_messages.id),
          limit: LIMIT + 1,
        });

        return messages;
      });
    } else {
      messages = await db.query.channel_messages.findMany({
        where: and(
          eq(channel_messages.channelId, channelId),
          eq(channel_messages.isDeleted, false)
        ),
        with: {
          member: {
            with: {
              profile: true,
            },
          },
          repliedMessage: {
            columns: {
              content: true,
            },
            with: {
              member: {
                columns: {},
                with: {
                  profile: {
                    columns: {
                      imageUrl: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: desc(channel_messages.id),
        limit: LIMIT + 1,
      });
    }

    return NextResponse.json({
      messages: messages.slice(0, LIMIT),
      nextCursor: messages.length === LIMIT + 1 ? messages[LIMIT].id : null,
    });
  } catch (error) {
    console.log("[MESSAGES_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
