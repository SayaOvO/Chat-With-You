import { ConversationWithProfiles, DirectMessage, Member, Profile } from "@/types";
import { ScrollArea } from "../ui/scroll-area";
import { MessageItem } from "./message-item";
import { getLastMessage } from "@/lib/query";

interface MessageListProps {
  peers: (Profile & { conversationId: string })[];
}
export function MessageList({ peers }: MessageListProps) {

  return (
    <div className="pl-2 space-y-2 pr-1 my-2">
      {peers.map((peer) => (
        <MessageItem key={peer.id} peer={peer} />
      ))}
    </div>
  );
}
