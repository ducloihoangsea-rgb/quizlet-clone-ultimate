import { redirect } from "next/navigation";
import { auth, signIn } from "@acme/auth";
import SignUpClient from "~/components/auth/sign-up-client";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const session = await auth();

  // Redirect to latest study sets if user is already logged in
  if (session) {
    redirect("/latest");
  }

  const initialMode = searchParams.mode === "signin" ? "signin" : "signup";

  const handleSignInGoogle = async () => {
    "use server";
    await signIn("google");
  };

  const handleSignInGithub = async () => {
    "use server";
    await signIn("github");
  };

  return (
    <SignUpClient 
      initialMode={initialMode}
      onSignInGoogle={handleSignInGoogle}
      onSignInGithub={handleSignInGithub}
    />
  );
}
