import { useSocket } from "@/providers/socket-provider";
import {
  useInfiniteQuery,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import qs from "query-string";

interface ChatQueryProps {
  queryKey: string;
  apiUrl: string;
  paramKey: "channelId" | "conversationId";
  paramValue: string;
}

export function useChatQuery({
  queryKey,
  apiUrl,
  paramKey,
  paramValue,
}: ChatQueryProps) {
  const fetchMessages = async ({
    pageParam,
  }: {
    pageParam: string | undefined;
  }) => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query: {
        [paramKey]: paramValue,
        cursor: pageParam,
      },
    });
    const res = await fetch(url);
    return res.json();
  };

  const { isConnected } = useSocket();

  const {
    data,
    error,
    fetchNextPage,
    isFetchingNextPage,
    status,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: [queryKey],
    queryFn: fetchMessages,
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    refetchInterval: isConnected ? false : 1000,
  });

  return {
    data,
    error,
    fetchNextPage,
    isFetchingNextPage,
    status,
    hasNextPage,
  };
}
