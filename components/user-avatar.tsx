import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UserAvatarProps {
  src: string;
  className?: string;
}

export function UserAvatar({ src, className, ...props }: UserAvatarProps) {
  return (
    <Avatar className={cn(
      "h-10 w-10 relative",
      className
    )}>
      <Image 
        src={src} alt="profile avatar" 
        className="rounded-full object-cover" 
        fill
        sizes="60 60"
      />
    </Avatar>
  );
}
