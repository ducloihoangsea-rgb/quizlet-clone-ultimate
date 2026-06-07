"use client";

import Link from "next/link";
import { Copy, FilePen, GraduationCap, Puzzle } from "lucide-react";

import { Card, CardContent } from "@acme/ui/card";
import { useTranslation } from "~/contexts/i18n-context";

const StudyModes = ({ studySetId }: { studySetId: string }) => {
  const { t } = useTranslation();
  
  const modes = [
    { Icon: Copy, text: t("flashcards"), href: `${studySetId}/flashcards` },
    { Icon: GraduationCap, text: t("learn"), href: `${studySetId}/learn` },
    { Icon: FilePen, text: t("test"), href: `${studySetId}/test` },
    { Icon: Puzzle, text: t("match"), href: `${studySetId}/match` },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {modes.map(({ href, Icon, text }, index) => (
        <Link href={href} key={index}>
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
