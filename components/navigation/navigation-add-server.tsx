"use client";

import { AppDispatch } from "@/store";
import { toggleCreateServerModal } from "@/store/toggle-modal-slice";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";

export function NavigationAddServer() {

  const dispatch: AppDispatch = useDispatch();
  return (
    <div>
      <div 
        className="p-3 border-border border-1"
        onClick={() => dispatch(toggleCreateServerModal({ open: true }))}
      >
        <button
          className="p-3 rounded-full bg-background hover:rounded-2xl
          hover:bg-green-500 transition group hover:cursor-pointer">
          <Plus className="h-6 w-6 text-green-500 
          group-hover:text-white transition"
        />
        </button>
      </div>
      <div className="bg-[#cccdd3] h-[2px] mx-4" />
    </div>
  )
}