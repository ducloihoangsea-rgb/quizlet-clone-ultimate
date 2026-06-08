import { redirect } from "next/navigation";
import { auth, signIn } from "@acme/auth";
import SignUpClient from "~/components/auth/sign-up-client";
import { registerUserAction } from "~/app/actions/auth-actions";

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

  const handleSignInFacebook = async () => {
    "use server";
    await signIn("facebook");
  };

  const handleSignInCredentials = async (formData: FormData) => {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", {
        email,
        password,
        redirectTo: "/latest",
      });
    } catch (error) {
      throw error;
    }
  };

  return (
    <SignUpClient 
      initialMode={initialMode}
      onSignInGoogle={handleSignInGoogle}
      onSignInGithub={handleSignInGithub}
      onSignInFacebook={handleSignInFacebook}
      onSignInCredentials={handleSignInCredentials}
      onRegister={registerUserAction}
    />
  );
}
