import { UserButton, redirectToSignIn } from "@clerk/nextjs";

interface UserInfoProps {
  profileName: string;
  profileUserName: string;
}

export function UserInfo({ profileName, profileUserName }: UserInfoProps) {
  /* //TODO: setup webhook to synchronize the user info */
  return (
    <div className="flex items-center bg-[#e3e5e8] px-3 py-2 space-x-4">
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-10 w-10",
          },
        }}
      />
      <div>
        <p>{profileName}</p>
        <p className="text-sm text-primary/80">{profileUserName}</p>
      </div>
    </div>
  );
}
