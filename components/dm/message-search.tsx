import { Input } from "../ui/input";

export function MessageSearch() {
  return (
    <div className="px-3">
      <Input 
        placeholder="Search chats"
        className="rounded-full focus-visible:ring-0 focus-visible:ring-offset-0 
        border-0 py-1 placeholder:text-sm"
      />
    </div>
  )
}