import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { NextApiResponseWithSocket } from "@/types";
import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method is not allowed." });
  }

  try {
    const { conversationId } = req.query;
    const profile = await currentProfilePages(req);

    if (!profile) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (!conversationId) {
      return res.status(400).json({ error: "Conversation is misssing" });
    }

    const [conversation] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId as string));

    if (!conversation) {
      return res.status(400).json({
        error: "Conversation is not found",
      });
    }

    if (
      !(
        conversation.userOneId === profile.id ||
        conversation.userTwoId === profile.id
      )
    ) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db
      .delete(conversations)
      .where(eq(conversations.id, conversationId as string));

    res?.socket?.server?.io?.emit("conversationDeleted", conversation.id);
    res.status(204).end();
  } catch (error) {
    console.log("[DELETE_CONVERSATION]", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}
