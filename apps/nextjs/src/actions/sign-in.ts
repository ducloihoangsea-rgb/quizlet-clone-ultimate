"use server";

import { signIn } from "@acme/auth";

export async function signInAction(email: string) {
  await signIn("email", { email });
}
