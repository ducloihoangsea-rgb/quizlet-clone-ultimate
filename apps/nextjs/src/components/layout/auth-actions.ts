"use server";

import { signIn } from "@acme/auth";

export async function signInOAuth(provider: string, redirectTo: string) {
  await signIn(provider, { redirectTo });
}