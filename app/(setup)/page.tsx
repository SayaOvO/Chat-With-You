import { initialProfile } from "@/lib/initialProfile";
import { redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";

export default async function SetupPage() {
  const profile = await initialProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  return redirect("/channels/me");
}
