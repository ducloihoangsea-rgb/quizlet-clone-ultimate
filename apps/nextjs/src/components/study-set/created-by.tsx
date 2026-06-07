"use client";

import React from "react";
import Link from "next/link";
import { User } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { useTranslation } from "~/contexts/i18n-context";

const CreatedBy = ({
  user,
}: {
  user: RouterOutputs["studySet"]["byId"]["user"];
}) => {
  const { id, image, name } = user;
  const { t } = useTranslation();

  return (
    <Link href={`/users/${id}`} className="flex items-center gap-4 select-none">
      <Avatar>
        <AvatarImage src={image ?? undefined} alt="" />
        <AvatarFallback>
          <User size={16} />
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground">{t("createdBy")}</span>
        <span className="text-sm font-bold">{name}</span>
      </div>
    </Link>
  );
};

export default CreatedBy;
