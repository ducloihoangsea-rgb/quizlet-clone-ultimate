"use client";

import Link from "next/link";
import { Copy, FilePen, GraduationCap, Puzzle } from "lucide-react";

import type { Session } from "@acme/auth";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { Card, CardContent } from "@acme/ui/card";
import { useTranslation } from "~/contexts/i18n-context";

const StudyModes = ({ studySetId, session }: { studySetId: string, session: Session | null }) => {
  const { t } = useTranslation();
  const { onOpenChange } = useSignInDialogContext();
  
  const modes = [
    { Icon: Copy, text: t("flashcards"), href: `${studySetId}/flashcards`, requiresAuth: false },
    { Icon: GraduationCap, text: t("learn"), href: `${studySetId}/learn`, requiresAuth: true },
    { Icon: FilePen, text: t("test"), href: `${studySetId}/test`, requiresAuth: true },
    { Icon: Puzzle, text: t("match"), href: `${studySetId}/match`, requiresAuth: true },
  ];

  const handleModeClick = (e: React.MouseEvent<HTMLAnchorElement>, requiresAuth: boolean) => {
    if (requiresAuth && !session) {
      e.preventDefault();
      onOpenChange(true);
    }
  };

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {modes.map(({ href, Icon, text, requiresAuth }, index) => (
        <Link href={href} key={index} onClick={(e) => handleModeClick(e, requiresAuth)}>
          <Card className="group hover:shadow-md cursor-pointer select-none">
            <CardContent className="flex items-center gap-2 p-4">
              <Icon
                size={20}
                className="transition-colors duration-300 group-hover:text-primary"
              />
              <span className="font-bold text-sm">{text}</span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default StudyModes;
