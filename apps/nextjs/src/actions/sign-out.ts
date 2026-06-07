"use server";

import { signOut } from "@acme/auth";

export async function signOutAction() {
  await signOut();
}
