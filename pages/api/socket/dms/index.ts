import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { conversations, direct_messages } from "@/lib/schema";
import { NextApiResponseWithSocket } from "@/types";
import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method is not allowd." });
  }

  try {
    const profile = await currentProfilePages(req);
    const { content, fileUrl, replyToId } = req.body;
    const { receiverId, conversationId } = req.query;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is missing." });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is missing." });
    }
    if (!content) {
      return res.status(400).json({ error: "Content is missing." });
    }

    // to test conversation exists
    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId as string));

    if (
      !(
        conversation.userOneId === profile.id &&
        conversation.userTwoId === (receiverId as string)
      ) &&
      !(
        conversation.userOneId === receiverId &&
        conversation.userTwoId === profile.id
      )
    ) {
      return res.status(400).json({ error: "Conversation is not existed." });
    }

    const message = await db.transaction(async (ctx) => {
      const [message] = await ctx
        .insert(direct_messages)
        .values({
          replyTo: replyToId,
          conversationId: conversationId as string,
          senderId: profile.id,
          fileUrl,
          content,
        })
        .returning();

      const newMessage = await ctx.query.direct_messages.findFirst({
        where: eq(direct_messages.id, message.id),
        with: {
          sender: true,
          repliedMessage: {
            columns: { content: true },
            with: {
              sender: true,
            },
          },
        },
      });
      return newMessage;
    });

    const conversationKey = `chat:${conversation.id}:messages`;
    res?.socket?.server?.io?.emit(conversationKey, message);
    return res.status(200).json(message);
  } catch (error) {
    console.log("[POST_DMS]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
