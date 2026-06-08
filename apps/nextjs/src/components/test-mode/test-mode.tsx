"use client";

import { useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Undo2, Settings } from "lucide-react";

import type { RouterOutputs } from "@acme/api";

import { api } from "~/trpc/react";
import GameResult from "../shared/game-result";
import TestAnswer from "./test-answer";
import TestForm from "./test-form";
import TestSettingsDialog from "../shared/test-settings-dialog";

type Test = RouterOutputs["studySet"]["testCards"];

type MultipleChoice = Test["multipleChoice"][number] & { userAnswer: string };
type Written = Test["written"][number] & { userAnswer: string };
type TrueFalse = Test["trueOrFalse"][number] & { userAnswer: string };

export interface Answers {
  multipleChoice: MultipleChoice[];
  written: Written[];
  trueOrFalse: TrueFalse[];
}

const TestMode = () => {
  const { id }: { id: string } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const limitParam = searchParams.get("limit");
  const typesParam = searchParams.get("types");
  const answerWithParam = searchParams.get("answerWith");

  const queryInput = {
    id,
    limit: limitParam ? parseInt(limitParam) : undefined,
    types: typesParam ? (typesParam.split(",") as any[]) : undefined,
    answerWith: answerWithParam ? (answerWithParam as any) : undefined,
  };

  const [test] = api.studySet.testCards.useSuspenseQuery(queryInput);
  const [studySet] = api.studySet.byId.useSuspenseQuery({ id });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [answer, setAnswer] = useState<Answers | undefined>();
  const [hard, setHard] = useState<number>(0);

  const cardCount = Object.values(test).flatMap((e) => e).length;

  const onSubmit = (answer: Answers) => {
    setAnswer(answer);
    setHard(calculateHard(answer));
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const calculateHard = (answer: Answers) => {
    const { multipleChoice, written, trueOrFalse } = answer;
    const hard =
      multipleChoice.reduce(
        (acc, { userAnswer, definition }) =>
          userAnswer !== definition ? acc + 1 : acc,
        0,
      ) +
      written.reduce(
        (acc, { userAnswer, definition }) =>
          userAnswer !== definition ? acc + 1 : acc,
        0,
      ) +
      trueOrFalse.reduce((acc, { answer, definition, userAnswer }) => {
        if (
          (answer === definition && userAnswer === "false") ||
          (answer !== definition && userAnswer === "true")
        )
          return acc + 1;
        return acc;
      }, 0);

    return hard;
  };

  const takeNewTest = () => {
    setAnswer(undefined);
    setHard(0);
  };

  const backToStudySet = () => {
    router.push(`/study-sets/${id}`);
  };

  if (answer) {
    return (
      <>
        <GameResult
          hard={hard}
          cardCount={cardCount}
          firstButton={{
            text: "Take a new test",
            description: "Take a new test with another questions.",
            Icon: <RotateCcw />,
            callback: takeNewTest,
          }}
          secondButton={{
            text: "Back to study set",
            description: "Back to study set",
            Icon: <Undo2 />,
            callback: backToStudySet,
          }}
        />
        <TestAnswer answer={answer} />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header thiết lập bài kiểm tra */}
      <div className="flex items-center justify-between border-b pb-4 mb-4 font-sans">
        <div className="space-y-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
            Bài kiểm tra
          </span>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
            {studySet.title}
          </h2>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-xl transition-all active:scale-95 border"
          title="Thiết lập bài kiểm tra"
        >
          <Settings size={20} />
        </button>
      </div>

      <TestForm test={test} onSubmit={onSubmit} />

      <TestSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        studySetId={id}
        studySetTitle={studySet.title}
        totalCards={studySet.flashcards.length}
      />
    </div>
  );
};

export default TestMode;
