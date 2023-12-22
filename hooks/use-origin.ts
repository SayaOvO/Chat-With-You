import { useEffect, useState } from "react";

export function useOrigin() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const origin =
    typeof window && window.location.origin ? window.location.origin : "";

  return origin;
}
