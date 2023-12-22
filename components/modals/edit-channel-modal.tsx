"use client";

import qs from "query-string";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { cn } from "@/lib/utils";
import { Hash, Mic } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleEditChannel } from "@/store/toggle-modal-slice";

const formSchema = z.object({
  type: z.enum(["text", "voice"], {
    required_error: "You need to select a channel type",
  }),
  name: z
    .string()
    .trim()
    .min(1, {
      message: "Name is required"
    })
    .refine((str) => str !== "general", {
      message: "Name can't be general",
    }),
});

export function EditChannelModal() {
  const { data, type, open } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: data?.channel?.name || "",
      type: data?.channel?.type || "text",
    },
    resolver: zodResolver(formSchema),
  });


  useEffect(() => {
    if (data?.channel) {
        form.setValue("name", data?.channel.name);
        form.setValue("type", data?.channel.type);
    }
  }, [data, form]);

  const handleClose = () => {
    form.reset();
    dispatch(toggleEditChannel({
      open: false
    }))
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/channels/${data?.channel?.id}`,
        query: {
          serverId: data?.server?.id,
        },
      });

      await axios.patch(url, {
        name: values.name,
        type: values.type,
      });
      router.refresh();
    } catch (error) {
      console.log("update channel", error);
    } finally {
      handleClose();
    }
  };
  const isLoading = form.formState.isSubmitting;
  const isModalOpen = type === "editChannel" && open;
  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 pt-8">
        <DialogHeader className="text-left px-3 text-primary/80">
          <DialogTitle>Edit Channel</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="flex flex-col  space-y-3 "
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
                          "flex items-center w-full bg-gray-100 px-3 rounded-md hover:cursor-pointer\
                        hover:bg-gray-200 transition",
                          field.value === "text" && "bg-gray-200"
                        )}
                      >
                        <FormLabel className="flex-1 flex items-center py-3 hover:cursor-pointer">
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
                            className="
                          focus:visible:ring-0 foucs:visible:ring-offset-0"
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
                        <FormLabel className="flex hover:cursor-pointer items-center flex-1 py-3">
                          <Mic className="h-6 w-6 mr-3 text-muted-foreground" />
                          <div className="flex-1">
                            <p>Voice</p>
                            <p className="text-sm">
                              Hang out together with voice, video, and screen
                              share
                            </p>
                          </div>
                        </FormLabel>
                        <FormControl>
                          <RadioGroupItem
                            disabled={isLoading}
                            value="voice"
                            className="focus:visible:ring-offset-0 focus:visible:ring-0"
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
                    <div className="flex bg-input items-center px-3 py-1 rounded-md">
                      {form.getValues("type") === "text" ? (
                        <Hash className="h-4 w-4 flex-shrink-0" />
                      ) : (
                        <Mic className="h-4 w-4 flex-shrink-0" />
                      )}
                      <Input
                        disabled={isLoading}
                        placeholder="new-channel"
                        className="h-10 px-1 bg-transparent outline-none focus-visible:ring-0
                    focus-visible:ring-offset-0"
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
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
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