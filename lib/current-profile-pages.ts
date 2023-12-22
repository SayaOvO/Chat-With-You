import { Profile } from "@/types";
import { redirectToSignIn } from "@clerk/nextjs";
import { getAuth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextApiRequest } from "next";
import { db } from "./db";
import { profiles } from "./schema";

export async function currentProfilePages(
  req: NextApiRequest
): Promise<Profile | null> {
  const { userId } = getAuth(req);

  if (!userId) {
    return redirectToSignIn();
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId));

  return profile;
}
