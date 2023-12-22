import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { currentUser, redirectToSignIn } from "@clerk/nextjs";
import { eq } from "drizzle-orm/sql/expressions/conditions";

export async function initialProfile() {
  const user = await currentUser();

  if (!user) {
    return redirectToSignIn();
  }

  const [currentProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, user.id));
  if (currentProfile) {
    return currentProfile;
  }
  const newProfile = await db.insert(profiles).values({
    userId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.emailAddresses[0].emailAddress,
    imageUrl: user.imageUrl,
    userName: user.username ?? "",
  });
  return newProfile;
}
