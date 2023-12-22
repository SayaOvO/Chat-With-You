import { cn } from "@/lib/utils";
import React, { HTMLProps, ReactElement, ReactPropTypes } from "react";

export interface LeafProps {
  attributes: HTMLProps<HTMLSpanElement>;
  children: React.ReactNode;
  leaf: {
    bold?: boolean;
    italic?: boolean;
    underlined?: boolean;
    title?: boolean;
    list?: boolean;
    hr?: boolean;
    ["code-snippet"]?: boolean;
    blockquote?: boolean;
  };
}

export function Leaf({ attributes, children, leaf }: LeafProps) {
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
