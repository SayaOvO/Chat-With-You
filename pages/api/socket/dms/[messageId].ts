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
  if (req.method !== "PATCH" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method is not allowed" });
  }

  try {
    const profile = await currentProfilePages(req);
    const { messageId, conversationId } = req.query;
    const { content, fileUrl } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!conversationId) {
      return res.status(400).json({ error: "Conversation ID is missing" });
    }

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    const [message] = await db
      .select()
      .from(direct_messages)
      .where(eq(direct_messages.id, +messageId));
    if (!message || message.conversationId !== conversationId) {
      return res.status(403).json({ error: "Forbidden" });
    }

    if (req.method === "PATCH") {
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      if (message.senderId !== profile.id) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const [updatedMessage] = await db
        .update(direct_messages)
        .set({
          content: content,
          updatedAt: new Date(),
        })
        .where(eq(direct_messages.id, +messageId))
        .returning();

      const updateKey = `chat:${conversationId}:messages:update`;
      res?.socket?.server?.io?.emit(updateKey, updatedMessage);
      return res.status(200).json(updatedMessage);
    }
    if (req.method === "DELETE") {
      //I think shoud test the profile is in this conversation,
      const [conversation] = await db
        .select()
        .from(conversations)
        .where(eq(conversations.id, conversationId as string));

      if (
        !(
          conversation.userOneId === profile.id ||
          conversation.userTwoId === profile.id
        )
      ) {
        return res.status(403).json({ error: "Forbidden" });
      }

      await db
        .delete(direct_messages)
        .where(eq(direct_messages.id, +messageId));

      const deleteKey = `chat:${conversationId}:messages:delete`;
      res?.socket?.server?.io?.emit(deleteKey, messageId);
      console.log("DETETE MESSAGE ID", messageId);
      res.status(204).end();
    }
  } catch (error) {
    console.log("[PATCH_DELETE_MESSAGE]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
