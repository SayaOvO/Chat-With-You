import { NavigationSidebar } from "@/components/navigation/navigation-sidebar";

export default function ChannelPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav className="h-full fixed left-0 hidden md:flex flex-col">
        <NavigationSidebar />
      </nav>
      <div className="h-screen min-h-screen">{children}</div>
    </>
  );
}
