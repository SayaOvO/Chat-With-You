"use client";

import { redirect, useRouter } from "next/navigation";
import { useState } from "react";

import { useAppDispatch, useAppSelector } from "@/store";
import { useOrigin } from "@/hooks/use-origin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toggleInvitePeople } from "@/store/toggle-modal-slice";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Copy, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";

export function InvitePeopleModal() {
  const { open, data, type } = useAppSelector((state) => state.modal);
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();
  const origin = useOrigin();

  const dispatch = useAppDispatch();

  if (!data) {
    return null;
  }
  const { server } = data;

  const inviteURL = `${origin}/invite/${server?.inviteCode}`;

  const onCopy = () => {
    setIsCopied(true);
    if (navigator.clipboard && server?.inviteCode) {
      navigator.clipboard.writeText(inviteURL);
    }
    setTimeout(() => setIsCopied(false), 3000);
  };

  const onNew = async () => {
    const response = await axios.patch(`/api/servers/${server?.id}/invite`);
    router.refresh();
    dispatch(toggleInvitePeople({
      open: true,
      data: { server: response.data },
      type: "invitePeople"
    }))
  };

  const isModalOpen = type === "invitePeople" && open;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => dispatch(toggleInvitePeople({ open: false }))}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Invite friend to{" "}
            <span className="text-semibold">{data.server?.name}</span>
          </DialogTitle>
        </DialogHeader>
        <form className="flex flex-col space-y-2">
          <Label>Server Invite Link</Label>
          <div className="flex items-center space-x-2 hover:cursor-pointer
          text-primary/80 hover:text-primary">
            <Input
              readOnly
              value={inviteURL}
              className="p-2 focus-visible:ring-0 focus-visible:ring-offset-0
              bg-muted text-base text-primary/80"
            />
            {isCopied ? (
              <Check className="h-5 w-5" />
            ): (
              <Copy className="h-5 w-5" onClick={onCopy} />
            )}
          </div>
          <Button
            variant="link"
            className="self-start text-xs p-0 text-primary/80"
            type="button"
            onClick={onNew}
          >
            Generate a new link
            <RefreshCw className="h-4 w-4 ml-1" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
