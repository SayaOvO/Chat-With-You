"use client";

import qs from "query-string";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleLeaveServer } from "@/store/toggle-modal-slice";

export function LeaveServerModal() {
  const { open, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!data) {
    return null;
  }
  const { server, profile } = data;
  const isModalOpen = type === "leaveServer" && open;

  const member = server?.members.find(
    (member) => member.profileId === profile?.id
  );

  const onLeave = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/members/${member?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.delete(url);
      dispatch(
        toggleLeaveServer({
          open: false,
        })
      );
      router.refresh();
    } catch (error) {
      console.log("leave-server-modal onLeave");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() =>
        dispatch(
          toggleLeaveServer({
            open: false,
          })
        )
      }
    >
      <DialogContent className="p-0">
        <DialogHeader className="text-left px-4 py-6 space-y-3">
          <DialogTitle>Leave &apos{server?.name}&apos</DialogTitle>
          <DialogDescription className="text-base">
            Are you sure you want to leave{" "}
            <span className="font-semibold text-primary">{server?.name}</span>?
            You won&apost be able to rejoin this server unless you are re-invited.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="space-x-3 bg-gray-100 px-4 py-4">
          <Button
            disabled={isLoading}
            variant="ghost"
            className="text-muted-foreground hover:text-muted-foreground hover:underline hover:bg-transparent
            focus-visible:ring-0 focus-visible:ring-offset-0
            "
            onClick={() =>
              dispatch(
                toggleLeaveServer({
                  open: false,
                })
              )
            }
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            className="bg-rose-500 hover:bg-rose-600 transition
            focus-visible:ring-0 focus-visible:ring-offset-0
          "
            onClick={onLeave}
          >
            Leave Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
