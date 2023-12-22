import { useQuery } from "@tanstack/react-query";
import qs from "query-string";

interface LastMessageProps {
  conversationId: string;
}

async function fetchLastestMessage(conversationId: string) {
  const url = qs.stringifyUrl({
    url: "/api/dms/lastest-message",
    query: {
      conversationId,
    },
  });
  const res = await fetch(url);
  return res.json();
}
export function useLastMessage({ conversationId }: LastMessageProps) {
  const { data, status } = useQuery({
    queryKey: [`${conversationId}:lastest`],
    queryFn: () => fetchLastestMessage(conversationId),
  });

  return {
    data,
    status,
  };
}
