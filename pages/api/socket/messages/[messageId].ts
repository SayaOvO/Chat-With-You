import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { hasDeletePermision, hasEditPermision } from "@/lib/query";
import { channel_messages } from "@/lib/schema";
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
    const { messageId, serverId, channelId } = req.query;
    const { content, fileUrl } = req.body;

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!serverId) {
      return res.status(400).json({ error: "Server ID is missing" });
    }

    if (!channelId) {
      return res.status(400).json({ error: "Channel ID is missing" });
    }

    if (!messageId) {
      return res.status(400).json({ error: "Message ID is required" });
    }

    if (req.method === "PATCH") {
      if (!content) {
        return res.status(400).json({ error: "Content is required" });
      }
      const canEdit = await hasEditPermision(
        profile.id,
        serverId as string,
        +messageId
      );

      if (!canEdit) {
        return res.status(403).json({ error: "Forbidden" });
      }

      const [updatedMessage] = await db
        .update(channel_messages)
        .set({
          content: content,
          updatedAt: new Date(),
        })
        .where(eq(channel_messages.id, +messageId))
        .returning();

      const updateKey = `chat:${channelId}:messages:update`;
      res?.socket?.server?.io?.emit(updateKey, updatedMessage);
      return res.status(200).json(updatedMessage);
    }
    if (req.method === "DELETE") {
      const canDelete = await hasDeletePermision(
        profile.id,
        serverId as string,
        messageId as string
      );

      if (!canDelete) {
        return res.status(403).json({ error: "Forbidden" });
      }
      await db
        .update(channel_messages)
        .set({
          isDeleted: true,
        })
        .where(eq(channel_messages.id, +messageId));

      const deleteKey = `chat:${channelId}:messages:delete`;
      res?.socket?.server?.io?.emit(deleteKey, messageId);
      console.log("DETETE MESSAGE ID", messageId);
      res.status(204).end();
    }
  } catch (error) {
    console.log("[PATCH_DELETE_MESSAGE]", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
