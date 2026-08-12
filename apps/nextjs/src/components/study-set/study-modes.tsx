"use client";

import Link from "next/link";
import { Copy, FilePen, GraduationCap, Puzzle } from "lucide-react";

import type { Session } from "@acme/auth";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";
import { Card, CardContent } from "@acme/ui/card";
import { useTranslation } from "~/contexts/i18n-context";
import LearnModeDialog from "./learn-mode-dialog";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useFlashcardsModeContext } from "~/contexts/flashcards-mode-context";

const StudyModes = ({ studySetId, session }: { studySetId: string, session: Session | null }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { onOpenChange } = useSignInDialogContext();
  const [isLearnModalOpen, setIsLearnModalOpen] = useState(false);
  const { starredOnly } = useFlashcardsModeContext();
  const qs = starredOnly ? "?starredOnly=true" : "";
  
  const modes = [
    { id: "flashcards", Icon: Copy, text: t("flashcards"), href: `${studySetId}/flashcards${qs}`, requiresAuth: false },
    { id: "learn", Icon: GraduationCap, text: t("learn"), href: `${studySetId}/learn${qs}`, requiresAuth: true },
    { id: "test", Icon: FilePen, text: t("test"), href: `${studySetId}/test${qs}`, requiresAuth: true },
    { id: "match", Icon: Puzzle, text: t("match"), href: `${studySetId}/match${qs}`, requiresAuth: true },
  ];

  const handleModeClick = (e: React.MouseEvent<HTMLAnchorElement>, requiresAuth: boolean, id: string) => {
    if (requiresAuth && !session) {
      e.preventDefault();
      onOpenChange(true);
      return;
    }
    if (id === "learn") {
      e.preventDefault();
      const savedGoal = localStorage.getItem(`quizlet_learn_goal_${studySetId}`);
      if (savedGoal) {
        router.push(`/study-sets/${studySetId}/learn?goal=${savedGoal}${starredOnly ? "&starredOnly=true" : ""}`);
      } else {
        setIsLearnModalOpen(true);
      }
    }
  };

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {modes.map(({ id, href, Icon, text, requiresAuth }, index) => (
        <Link href={href} key={index} onClick={(e) => handleModeClick(e, requiresAuth, id)}>
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
      <LearnModeDialog 
        open={isLearnModalOpen} 
        onOpenChange={setIsLearnModalOpen} 
        studySetId={studySetId}
        starredOnly={starredOnly}
      />
    </div>
  );
};

export default StudyModes;
