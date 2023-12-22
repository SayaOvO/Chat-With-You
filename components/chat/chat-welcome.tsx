import { Hash } from "lucide-react";

interface ChatWelcomeProps {
  type: "channel" | "conversation";
  name: string;
}
export function ChatWelcome({ name, type }: ChatWelcomeProps) {
  return (
    <div className="space-y-2">
      {type === "channel" && (
        <div
          className="h-[68px] w-[68px] rounded-full flex items-center 
        justify-center bg-[#6d6f78]"
        >
          <Hash className="h-[42px] w-[42px] text-white" />
        </div>
      )}
      <p className="text-3xl font-bold">
        {type === "channel" ? "Welcome to #" : ""}
        {name}
      </p>
      <p className="text-primary/80 text-sm">
        {type === "channel" ? (
          <>This is the start of the #{name} channel</>
        ) : (
          <>
            This the start of your conversation with <span className="font-semibold">{name}</span>
          </>
        )}
      </p>
    </div>
  );
}
