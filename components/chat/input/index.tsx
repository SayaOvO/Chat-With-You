"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useMemo } from "react";
import qs from "query-string";
import {
  Descendant,
  Editor,
  Node,
  NodeEntry,
  Range,
  Text,
  Transforms,
  createEditor,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { Leaf } from "./leaf";
import Prism from "prismjs";
import "prismjs/components/prism-markdown";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/store";
import { clearReplying } from "@/store/toggle-replying-slice";
import { X } from "lucide-react";

interface ChatInputProps {
  chatName: string;
  type: "channel" | "dm";
  apiUrl: string;
  query: Record<string, string>;
  chatId: string;
}

const initialValue = [
  {
    type: "p",
    children: [
      {
        text: "",
      },
    ],
  },
];

export function ChatInput({
  chatName,
  type,
  apiUrl,
  query,
  chatId,
}: ChatInputProps) {
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const data = useAppSelector((state) => state.replying[chatId]);

  const dispatch = useAppDispatch();
  const renderLeaf = useCallback((props: any) => <Leaf {...props} />, []);

  const decorate = useCallback(([node, path]: NodeEntry) => {
    const ranges: Range[] = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token: string | Prism.Token): number => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
      } else if (token.content instanceof Prism.Token) {
        return getLength(token.content);
      } else {
        return token.content.reduce((l, t) => l + getLength(t), 0);
      }
    };

    const tokens = Prism.tokenize(node.text, Prism.languages.markdown);
    let start = 0;

    for (const token of tokens) {
      const length = getLength(token);
      const end = start + length;

      if (typeof token !== "string") {
        ranges.push({
          [token.type]: true,
          anchor: { path, offset: start },
          focus: { path, offset: end },
        });
      }

      start = end;
    }

    return ranges;
  }, []);

  const handleSubmit = async (value: Descendant[]) => {
    try {
      const message: string = value
        .map((n) => Node.string(n))
        .join("\n")
        .trim();
      if (message === "") return;
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      await axios.post(url, {
        content: message,
        replyToId: data?.replyingId,
      });

      dispatch(
        clearReplying({
          id: chatId,
        })
      );

      Transforms.delete(editor, {
        at: {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        },
      });
    } catch (error) {
      console.log("send messages", error);
    }
  };


  useEffect(() => {
    ReactEditor.focus(editor)
  }, []);
  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
    >
      <form className="p-4 pb-6">
        {data?.replyingName && (
          <div className="bg-[#e3e5e8] p-2 rounded-t-md text-sm text-primary/80 flex items-center justify-between">
            <p>
              Replying to{" "}
              <span className="font-semibold">{data.replyingName}</span>
            </p>
            <button
              type="button"
              className="p-1 rounded-full bg-slate-600 text-white"
              onClick={() => dispatch(clearReplying({ id: chatId }))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <Editable
          renderLeaf={renderLeaf}
          decorate={decorate}
          placeholder={`Message ${(type === "channel" ? "#" : "@") + chatName}`}
          className={cn(
            "bg-muted py-3 px-8 outline-none focus-visible:ring-0 focus-visible:ring-offset-0\
            min-h-6",
            data?.replyingName ? "rounded-b-md" : "rounded-md"
          )}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              return;
            } else if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit(editor.children);
            }
          }}
        />
      </form>
    </Slate>
  );
}
