import { ChatHeader } from "@/components/chat/chat-header";
import { ChatMessages } from "@/components/chat/chat-messages";
import { ChatInput } from "@/components/chat/input";
import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";
import { initialConversation } from "@/lib/initial-conversation";
import { profiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MessagePage({
  params,
}: {
  params: { memberId: string };
}) {
  const profile = await currentProfile();

  if (!profile) {
    redirect("/");
  }
  const conversation = await initialConversation(profile.id, params.memberId);

  if (!conversation) {
    redirect("/");
  }
  const peerId =
    conversation.userOneId === profile.id
      ? conversation.userTwoId
      : conversation.userOneId;

  const [peer] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, peerId));

  if (!peer) {
    redirect("/");
  }
  return (
    <main className="flex-1 flex flex-col h-full">
      <ChatHeader 
        type="dm" 
        name={peer.name} 
      />
      <ChatMessages
        apiUrl="/api/dms"
        chatName={peer.name}
        chatId={conversation.id}
        type="conversation"
        socketApiUrl="/api/socket/dms"
        query={{
          conversationId: conversation.id,
        }}
        paramKey="conversationId"
        profile={profile}
      />
      <ChatInput
        type="dm"
        chatName={peer.name}
        query={{
          receiverId: peer.id,
          conversationId: conversation.id,
        }}
        apiUrl="/api/socket/dms"
        chatId={conversation.id}
      />
    </main>
  );
}
