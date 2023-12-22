//@ts-nocheck
"use client";

import { useRouter } from "next/navigation";
import qs from "query-string";

import { cn } from "@/lib/utils";
import Prism from "prismjs";
import "prismjs/components/prism-markdown";
import { useCallback, useEffect, useMemo } from "react";
import {
  Descendant,
  Editor,
  Node,
  Text,
  Transforms,
  createEditor,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import axios from "axios";
import { useAppDispatch, useAppSelector } from "@/store";
import { X } from "lucide-react";
import { clearReplying } from "@/store/toggle-replying-slice";
interface ChatInputProps {
  channelName: string;
  type: "channel" | "me";
  apiUrl: string;
  query: Record<string, string>;
  channelOrDMId: string;
}

const initialValue: (Descendant & { type: string })[] = [
  {
    type: "paragraph",
    children: [
      {
        text: "",
      },
    ],
  },
];

export const renderLeaf = (props) => <Leaf {...props} />;

export const decorate = ([node, path]) => {
  const ranges = [];

  if (!Text.isText(node)) {
    return ranges;
  }

  const getLength = (token) => {
    if (typeof token === "string") {
      return token.length;
    } else if (typeof token.content === "string") {
      return token.content.length;
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
};

export function ChatInput({
  channelName,
  type,
  apiUrl,
  query,
  channelOrDMId,
}: ChatInputProps) {
  const router = useRouter();

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  const data = useAppSelector((state) => state.replying[channelOrDMId]);
  const dispatch = useAppDispatch();
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);
  const decorate = useCallback(([node, path]) => {
    const ranges = [];

    if (!Text.isText(node)) {
      return ranges;
    }

    const getLength = (token) => {
      if (typeof token === "string") {
        return token.length;
      } else if (typeof token.content === "string") {
        return token.content.length;
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

  const handleSubmit = async (value: any) => {
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
        replyToId: data?.replyingId
      });

      dispatch(clearReplying({
        id: channelOrDMId
      }));

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
    <Slate editor={editor} initialValue={initialValue} onChange={() => {}}>
      <form className="relative p-4 pb-6">
        {data?.replyingName && (
          <div className="bg-[#e3e5e8] p-2 rounded-t-md text-sm text-primary/80 flex items-center justify-between">
            <p>
              Replying to{" "}
              <span className="font-semibold">{data.replyingName}</span>
            </p>
            <button
              type="button"
              className="p-1 rounded-full bg-slate-600 text-white"
              onClick={() => dispatch(clearReplying({ id: channelOrDMId }))}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <Editable
          decorate={decorate}
          renderLeaf={renderLeaf}
          placeholder={`Message ${
            type === "channel" ? "#" + channelName : channelName
          }`}
          onKeyDown={(event) => {
            if (event.key === "Enter" && event.shiftKey) {
              return;
            } else if (event.key === "Enter") {
              event.preventDefault();
              handleSubmit(editor.children);
            }
          }}
          className={cn(
            "bg-muted py-3 px-8 outline-none text-primary/80",
            data?.replyingName ? "rounded-b-md" : "rounded-md"
          )}
        />
      </form>
    </Slate>
  );
}

function Leaf({ attributes, children, leaf }) {
  return (
    <span
      {...attributes}
      className={cn(
        leaf.bold && "font-bold",
        leaf.italic && "italic",
        leaf.underlined && "underline",
        leaf.title && "inline-block bold text-xl mt-5 mb-[10px]",
        leaf.list && "pl-[10px] text-xl leading-[10px]",
        leaf.hr && "block text-center border-b-2 border-solid border-[#ddd]",
        leaf["code-snippet"] && "font-mono bg-[#eee] p-[3px]",
        leaf.blockquote &&
          "inline-block border-l-2 border-solid border-[#ddd] pl-[10px] text-[#aaa] italic"
      )}
    >
      {children}
    </span>
  );
}
