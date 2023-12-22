"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ServerWithMemberAndChannel } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleManageMember } from "@/store/toggle-modal-slice";
import { MemberItem } from "../server/member-item";

export function ManageMemberModal() {
  const { open, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  if (!data) {
    return null;
  }

  const { server } = data as { server: ServerWithMemberAndChannel };
  const isModalOpen = type === "manageMember" && open;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() =>
        dispatch(
          toggleManageMember({
            open: false,
          })
        )
      }
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription className="text-xs">
            {server?.members?.length} Members
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="space-y-2">
            {server?.members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
