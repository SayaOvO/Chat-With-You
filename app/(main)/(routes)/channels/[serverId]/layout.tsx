import { ServerSidebar } from "@/components/server/server-sidebar"

export default async function ServerPageLayout({
  params,
  children
}: {
  params: {
    serverId: string
  },
  children: React.ReactNode
}) {
  return (
    <div className="h-full flex">
      <div className="hidden md:flex ml-[72px]">
        <ServerSidebar serverId={params.serverId} />
      </div>
      {children}
    </div>
  )
  
}