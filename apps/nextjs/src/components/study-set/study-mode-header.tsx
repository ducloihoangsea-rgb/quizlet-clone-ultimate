"use client";

import { useParams, useRouter } from "next/navigation";
import { Copy, FilePen, GraduationCap, Puzzle, X, ChevronDown } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { useTranslation } from "~/contexts/i18n-context";

interface StudyModeHeaderProps {
  currentMode: "flashcards" | "learn" | "test" | "match";
  studySetId: string;
}

const StudyModeHeader = ({ currentMode, studySetId }: StudyModeHeaderProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  const modes = [
    { id: "flashcards", Icon: Copy, text: t("flashcards"), color: "text-blue-500" },
    { id: "learn", Icon: GraduationCap, text: t("learn"), color: "text-green-500" },
    { id: "test", Icon: FilePen, text: t("test"), color: "text-orange-500" },
    { id: "match", Icon: Puzzle, text: t("match"), color: "text-purple-500" },
  ] as const;

  const current = modes.find((m) => m.id === currentMode) ?? modes[0];
  const CurrentIcon = current.Icon;

  const handleModeChange = (modeId: string) => {
    if (modeId === currentMode) return;
    router.push(`/study-sets/${studySetId}/${modeId}`);
  };

  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6 select-none bg-background sticky top-0 z-30">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-accent rounded-xl transition-all outline-none font-bold text-lg text-foreground">
            <CurrentIcon className={`w-5 h-5 ${current.color}`} />
            <span>{current.text}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56 p-1">
          {modes.map((mode) => {
            const Icon = mode.Icon;
            const isSelected = mode.id === currentMode;
            return (
              <DropdownMenuItem
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex items-center gap-3 cursor-pointer py-2.5 px-3 font-semibold text-sm rounded-lg ${
                  isSelected ? "bg-accent text-accent-foreground" : ""
                }`}
              >
                <Icon className={`w-4 h-4 ${mode.color}`} />
                <span>{mode.text}</span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={() => router.push(`/study-sets/${studySetId}`)}
        className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-all outline-none"
        title={t("backToSet")}
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default StudyModeHeader;
