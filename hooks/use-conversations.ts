import { Conversation } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ConversationsQueryProps {
  profileId: string;
}

const fetchConversations = async () => {
  const res = await fetch(`/api/conversations`);
  return res.json();
};
export function useConversationsQuery({ profileId }: ConversationsQueryProps) {
  const { data, status } = useQuery<Conversation[]>({
    queryKey: ["conversations"],
    queryFn: fetchConversations,
  });

  return {
    data,
    status,
  };
}
