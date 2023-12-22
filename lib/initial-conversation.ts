import { eq, or } from "drizzle-orm";
import { db } from "./db";
import { conversations } from "./schema";

export async function initialConversation(userId: string, receiverId: string) {
  try {
    const conversation = await db.query.conversations.findFirst({
      where: or(
        eq(conversations.userOneId, userId),
        eq(conversations.userOneId, receiverId)
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
