import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { members, servers } from "@/lib/schema";
import { redirectToSignIn } from "@clerk/nextjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function InvitePage({
  params,
}: {
  params: { inviteCode: string };
}) {
    const profile = await currentProfile();
    if (!profile) {
      return redirect("/");
    }

    const [server] = await db
      .select()
      .from(servers)
      .where(eq(servers.inviteCode, params.inviteCode));

    if (!server) {
      return redirect("/");
    }

    const [existingMember] = await db
      .select()
      .from(members)
      .where(
        and(eq(members.profileId, profile.id), eq(members.serverId, server.id))
      );

    if (existingMember) {
      return redirect(`/channels/${server.id}`);
    }

    const [newMember] = await db
      .insert(members)
      .values({
        profileId: profile.id,
        serverId: server.id,
      })
      .returning();

    if (newMember) {
      return redirect(`/channels/${newMember.serverId}`);
    }
    return null;
}
