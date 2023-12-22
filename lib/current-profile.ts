import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { profiles } from "./schema";

export async function currentProfile() {
    const { userId } = auth();
    const q = auth();

    if (!userId) {
        return null;
    }
    const [profile] = await db.select().from(profiles).where(
        eq(profiles.userId, userId)
    )
    return profile;
}