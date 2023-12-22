"use client";

import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export function NavigationDM() {
  const router = useRouter();
  return (
    <div>
      <div className="p-3 border-border border-1">
        <button
          className="p-3 rounded-full bg-background hover:rounded-2xl
          hover:bg-blue-500 transition group hover:cursor-pointer">
          <MessageSquare className="h-6 w-6 text-blue-500 
          group-hover:text-white transition"
          onClick={() => router.push("/channels/me")}
        />
        </button>
      </div>
      <div className="bg-[#cccdd3] h-[2px] mx-4" />
    </div>
  )
}