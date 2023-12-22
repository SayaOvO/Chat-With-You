import { useSocket } from "@/providers/socket-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useConversationSocket() {
  const { socket, isConnected } = useSocket();
  const client = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }
    socket.on("conversationDeleted", (conversationId: string) => {
      router.push("/channels/me");
    });

    return () => socket.off("conversationDeleted");
  }, [isConnected]);
}
