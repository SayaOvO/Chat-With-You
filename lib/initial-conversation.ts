import { and, eq, or } from "drizzle-orm";
import { db } from "./db";
import { conversations } from "./schema";

export async function initialConversation(userId: string, receiverId: string) {
  try {
    const conversation = await db.query.conversations.findFirst({
      where: or(
        and(
          eq(conversations.userOneId, userId),
          eq(conversations.userTwoId, receiverId)
        ),
        and(
          eq(conversations.userOneId, receiverId),
          eq(conversations.userTwoId, userId)
        )
      ),
    });

    if (conversation) {
      return conversation;
    }

    const [newConversation] = await db
      .insert(conversations)
      .values({
        userOneId: userId,
        userTwoId: receiverId,
      })
      .returning();

    return newConversation;
  } catch (error) {
    console.log(error);
  }
}
