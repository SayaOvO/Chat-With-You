import { currentProfilePages } from "@/lib/current-profile-pages";
import { db } from "@/lib/db";
import { conversations } from "@/lib/schema";
import { eq, or } from "drizzle-orm";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const profile = await currentProfilePages(req);

    if (!profile) {
      return res.status(401).json({ error: "Unauthorized" });
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
    return res.status(200).json(allConversations);
  } catch (error) {
    console.log("[GET_ALL_CONVERSATIONS", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
}
