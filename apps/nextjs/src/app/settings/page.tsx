import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@acme/auth";

import DarkMode from "~/components/settings/dark-mode";
import DeleteAccount from "~/components/settings/delete-account";
import EditProfilePicture from "~/components/settings/edit-profile-picture";
import SettingsTitle from "~/components/settings/settings-title";

export const metadata: Metadata = {
  title: "Quizlet - Settings",
};

export default async function Settings() {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  return (
    <>
      <SettingsTitle />
      <EditProfilePicture user={session.user} />
      <DarkMode />
      <DeleteAccount user={session.user} />
    </>
  );
}
