import { RefObject, useEffect } from "react";

interface ChatAutoScrollProps {
  chatRef: RefObject<HTMLDivElement>;
  loadMore: () => void;
  shouldLoadMore: boolean;
}
export function useChatAutoScroll({
  chatRef,
  loadMore,
  shouldLoadMore,
}: ChatAutoScrollProps) {
  useEffect(() => {
    const chatDiv = chatRef.current;

    const handleScoll = () => {
      const scrollTop = chatDiv?.scrollTop;
      if (scrollTop === 0 && shouldLoadMore) {
        loadMore();
      }
    };
    // throttle?
    chatDiv?.addEventListener("scroll", handleScoll);

    return () => chatDiv?.removeEventListener("scroll", handleScoll);
  }, [loadMore, chatRef, shouldLoadMore]);
}
