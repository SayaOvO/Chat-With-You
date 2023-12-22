import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/input";
import { MediumRoom } from "@/components/medium-room";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { getServerWithChannelsAndMembers } from "@/lib/query";
import { channels, members } from "@/lib/schema";
import { redirectToSignIn } from "@clerk/nextjs";
import { eq } from "drizzle-orm";
import { NEXT_CACHE_TAGS_HEADER } from "next/dist/lib/constants";
import { redirect } from "next/navigation";

export default async function ChannelPage({
  params,
}: {
  params: { serverId: string; channelId: string };
}) {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const channel = await db.query.channels.findFirst({
    where: eq(channels.id, params.channelId),
  });

  const member = await db.query.members.findFirst({
    where: eq(members.profileId, profile.id),
  });

  if (!channel || !member) {
    redirect("/");
  }

  // current Member
  const isMod = member.memberRole !== "member";

  console.log("CHANNEL:", channel);
  return (
    <main className="flex-1 flex flex-col h-full">
      {channel.type === "text" && (
        <ChatHeader
          serverId={params.serverId}
          type="channel"
          name={channel.name}
        />
      )}
      {channel.type === "text" && (
        <>
          <ChatMessages
            type="channel"
            apiUrl="/api/messages"
            chatId={channel.id}
            chatName={channel.name}
            socketApiUrl="/api/socket/messages"
            query={{
              serverId: channel.serverId,
              channelId: channel.id,
            }}
            isMod={isMod}
            profile={profile}
            paramKey="channelId"
          />
          <ChatInput
            type="channel"
            chatName={channel.name}
            apiUrl="/api/socket/messages"
            query={{
              channelId: channel.id,
              serverId: params.serverId,
            }}
            chatId={channel.id}
          />
        </>
      )}
      {channel.type === "voice" && (
        <MediumRoom
          channelName={channel.name}
          chatId={`/channels/${params.serverId}/${params.channelId}`}
          video={true}
        />
      )}
    </main>
  );
}
