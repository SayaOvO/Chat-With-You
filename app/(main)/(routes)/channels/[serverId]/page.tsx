import { db } from "@/lib/db";
import { channels } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function ServerPage({
  params,
}: {
  params: { serverId: string };
}) {
  const channel = await db.query.channels.findFirst({
    where: and(
      eq(channels.name, "general"),
      eq(channels.serverId, params.serverId)
    )
  });

  if (channel) {
    return redirect(`/channels/${params.serverId}/${channel.id}`);
  } else {
    return redirect("/channels/me");
  }
  return null;
}
