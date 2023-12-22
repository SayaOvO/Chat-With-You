"use client";

import qs from "query-string";
import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleCreateChannel } from "@/store/toggle-modal-slice";
import { cn } from "@/lib/utils";
import { Hash, Mic } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Channel } from "@/types";

const fromSchema = z.object({
  type: z.enum(["text", "voice"]),
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Name is required",
    })
    .refine((str) => str !== "general", {
      message: "Name can't be general",
    }),
});

export function CreateChannelModal() {
  const { type, open, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm<z.infer<typeof fromSchema>>({
    defaultValues: {
      name: "",
      type: data?.channelType || "text",
    },
    resolver: zodResolver(fromSchema),
  });

  useEffect(() => {
    if (data?.channelType) {
      form.setValue("type", data.channelType);
    }
  }, [data, form]);

  const handleSubmit = async (values: z.infer<typeof fromSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: "/api/channels",
        query: {
          serverId: data?.server?.id,
        },
      });
      const res = await axios.post<Channel>(url, values);
      form.reset();
      router.push(`/channels/${data?.server?.id}/${res.data.id}`);
      router.refresh();
    } catch (error) {
      console.log("create channel", error);
    } finally {
      dispatch(
        toggleCreateChannel({
          open: false,
        })
      );
    }
  };

  const isModalOpen = open && type === "createChannel";
  const isLoading = form.formState.isSubmitting;

  const handleClose = () => {
    dispatch(
      toggleCreateChannel({
        open: false,
      })
    );
    form.reset();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 pt-8">
        <DialogHeader className="text-left px-3 text-primary/80">
          <DialogTitle>Create Channel</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col space-y-3"
          >
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="px-3 py-2">
                  <FormLabel className="uppercase">channel type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col"
                      disabled={isLoading}
                    >
                      <FormItem
                        className={cn(
                          "flex items-center w-full bg-gray-100 px-3 rounded\
                          -md hover:cursor-pointer hover:bg-gray-200 transition",
                          field.value === "text" && "bg-gray-200"
                        )}
                      >
                        <FormLabel
                          className="flex-1 flex items-center py-3 
                        hover:cursor-pointer"
                        >
                          <Hash className="h-6 w-6 mr-3 text-muted-foreground" />
                          <div className="flex-1">
                            <p>Text</p>
                            <p className="text-sm">
                              Send messages, images, GIFS, emoji, opinions
                            </p>
                          </div>
                        </FormLabel>

                        <FormControl>
                          <RadioGroupItem
                            disabled={isLoading}
                            value="text"
                            className="focus-visible:ring-0 focus-visible:ring-offset-0"
                          />
                        </FormControl>
                      </FormItem>
                      <FormItem
                        className={cn(
                          "flex items-center w-full bg-gray-100 px-3 rounded-md\
                          hover:bg-gray-200 transition",
                          field.value === "voice" && "bg-gray-200"
                        )}
                      >
                        <FormLabel
                          className="flex hover:cursor-pointer items-center
                        flex-1 py-3"
                        >
                          <Mic className="h-6 w-6 mr-3 text-muted-foreground" />
                          <div className="flex-1">
                            <p>Voice</p>
                            <p className="text-sm">
                              Hang out together with voice, video, and screen
                            </p>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem
                            disabled={isLoading}
                            value="voice"
                            className="focus-visible:ring-offset-0 focus-visible:ring-0"
                          />
                        </FormControl>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="px-3 py-2">
                  <FormLabel className="uppercase">Channel Name</FormLabel>
                  <FormControl>
                    <div className="flex bg-muted items-center px-3 py-1 rounded-md">
                      {form.getValues("type") === "text" ? (
                        <Hash className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Mic className="h-4 w-4 flex-shrink-0" />
                      )}
                      <Input
                        disabled={isLoading}
                        placeholder="new-channel"
                        className="h-10 px-1 bg-transparent outline-none focus-visible:ring-0
                    focus-visible:ring-offset-0 border-0"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="space-x-3 bg-gray-100 px-4 py-4">
              <Button
                disabled={isLoading}
                variant="ghost"
                className="text-muted-foreground hover:text-muted-foreground 
            hover:underline hover:bg-transparent
            focus-visible:ring-0 focus-visible:ring-offset-0
            "
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading || form.getValues("name") === ""}
                className="bg-blue-500 hover:bg-blue-600 transition
            focus-visible:ring-0 focus-visible:ring-offset-0
          "
                type="submit"
              >
                Create Channel
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
