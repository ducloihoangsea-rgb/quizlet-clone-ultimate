"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@acme/ui/button";

export default function SignInButton() {
  const router = useRouter();

  return (
    <Button 
      onClick={() => router.push("/sign-up?mode=signin")}
      className="bg-[#4257b2] hover:bg-[#3b4c9b] text-white font-extrabold px-6 rounded-xl transition-all"
    >
      Đăng nhập
    </Button>
  );
}
