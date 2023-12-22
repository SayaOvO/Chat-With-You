import { MessageSidebar } from "@/components/dm/message-sidebar"
import { currentProfile } from "@/lib/current-profile"
import { redirect } from "next/navigation";

export default async function MePageLayout({
  params,
  children
}: {
  params: {
    serverId: string
  },
  children: React.ReactNode
}) {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/")
  }

  console.log("param:", params.serverId);
  return (
    <div className="h-full flex">
      <div className="hidden md:flex ml-[72px] w-60">
        <MessageSidebar 
          profileId={profile.id} 
          name={profile.name}
          username={profile.userName}
        />
      </div>
      {children}
    </div>
  )
  
}