import { MessageSidebar } from "@/components/dm/message-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { redirect } from "next/navigation";

export default async function MePage() {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  return (
    <div className="h-full flex w-full">
      <div className="h-full md:ml-[72px] w-full md:w-60">
        <MessageSidebar
          profileId={profile.id}
          name={profile.name}
          username={profile.userName}
        />
      </div>
      <div className="hidden flex-1 md:flex items-center justify-center">
        <div className="text-primary/80 text-center">
          <p>Choose one chat or server to chat with</p>
          <p>You can also create a server yourself</p>
          <p>Have fun!</p>
        </div>
      </div>
    </div>
  );
}
