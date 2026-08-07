import Link from "next/link";
import { Edit } from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@acme/ui/tooltip";

import StudySetFoldersDialog from "./study-set-folders-dialog";
import StudySetOptionsDropdown from "./study-set-options-dropdown";
import StudySetShareDialog from "./study-set-share-dialog";

import { useTranslation } from "~/contexts/i18n-context";

interface StudySetCTAProps {
  session: Session | null;
  id: string;
  userId: string;
}

const StudySetCTA = ({ session, id, userId }: StudySetCTAProps) => {
  const { t } = useTranslation();
  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex gap-2">
        {session && <StudySetFoldersDialog session={session} />}
        {session?.user.id === userId && (
          <Tooltip>
            <Link href={`/study-sets/${id}/edit`}>
              <TooltipTrigger asChild>
                <Button size="icon" variant="outline">
                  <Edit size={16} />
                  <span className="sr-only">{t("editKey")}</span>
                </Button>
              </TooltipTrigger>
            </Link>
            <TooltipContent>
              <p>{t("editKey")}</p>
            </TooltipContent>
          </Tooltip>
        )}
        <StudySetShareDialog id={id} />
        <StudySetOptionsDropdown
          id={id}
          isOwner={session?.user.id === userId}
          userId={session?.user.id}
        />
      </div>
    </TooltipProvider>
  );
};

export default StudySetCTA;
