"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@acme/ui/button";
import { useTranslation } from "~/contexts/i18n-context";

export default function SignInButton() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Button 
      onClick={() => router.push("/sign-up?mode=signin")}
      className="bg-[#4257b2] hover:bg-[#3b4c9b] text-white font-extrabold px-6 rounded-xl transition-all"
    >
      {t("signin")}
    </Button>
  );
}
