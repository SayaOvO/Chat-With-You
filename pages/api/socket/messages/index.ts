import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { channel_messages, channels, members } from "@/lib/schema";
import { NextApiResponseWithSocket } from "@/types";
import { and, eq } from "drizzle-orm";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl, replyToId } = req.body;
    const { serverId, channelId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    const channel = await db.query.channels.findFirst({
      where: and(
        eq(channels.id, channelId as string),
        eq(channels.serverId, serverId as string)
      ),
    });
    const member = await db.query.members.findFirst({
      where: and(
        eq(members.profileId, profile.id),
        eq(members.serverId, serverId as string)
      ),
    });

    if (!channel || !member) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const message = await db.transaction(async (ctx) => {
      const [message] = await ctx
        .insert(channel_messages)
        .values({
          channelId: channelId as string,
          memberId: member.id,
          content,
          fileUrl,
          replyTo: replyToId,
        })
        .returning();
      const newMessage = await ctx.query.channel_messages.findFirst({
        where: eq(channel_messages.id, message.id),
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
      });
      return newMessage;
    });

    const channelKey = `chat:${channelId}:messages`;
    res?.socket?.server?.io?.emit(channelKey, message);

    return res.status(200).json(message);
  } catch (error) {
    console.log("[POST_MESSAGES]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
