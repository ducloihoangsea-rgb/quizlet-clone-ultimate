"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@acme/ui/button";
import { useTranslation } from "~/contexts/i18n-context";

interface EditStudySetButtonProps {
  id: string;
}

const EditStudySetButton = ({ id }: EditStudySetButtonProps) => {
  const { t } = useTranslation();

  return (
    <Link href={`/study-sets/${id}/edit`} className="select-none">
      <Button size="lg" className="m-auto mb-8 block font-bold">
        {t("addOrRemoveTerms")}
      </Button>
    </Link>
  );
};

export default EditStudySetButton;
