"use client";

import React, { useState } from "react";
import { 
  Shuffle, 
  Star, 
  Volume2, 
  ChevronDown, 
  ChevronUp, 
  Check,
  ChevronRight,
  BookOpen,
  Info
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Switch } from "@acme/ui/switch";
import { useTranslation } from "~/contexts/i18n-context";

export interface LearnConfig {
  shuffle: boolean;
  starredOnly: boolean;
  soundEffects: boolean;
  questionTypes: {
    mc: boolean;
    written: boolean;
    flashcards: boolean;
  };
  answerWith: "term" | "definition" | "both";
  showImages: {
    question: boolean;
    answer: boolean;
  };
  gradingLevel: "loose" | "medium" | "strict";
  requireCorrect: boolean;
  oneAnswerSuffices: boolean;
  textToSpeech: boolean;
}

interface LearnOptionsDialogProps {
  config: LearnConfig;
  onSave: (config: LearnConfig) => void;
  onRestart: () => void;
  hasStarredTerms?: boolean;
  triggerElement?: React.ReactNode;
}

const LearnOptionsDialog = ({
  config: initialConfig,
  onSave,
  onRestart,
  hasStarredTerms = false,
  triggerElement
}: LearnOptionsDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<LearnConfig>({ ...initialConfig });

  // Accordion state
  const [sections, setSections] = useState({
    questionType: true,
    answerWith: true,
    showImages: true,
    gradingOptions: true,
    textToSpeech: true,
  });

  const toggleSection = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    onSave(config);
    setOpen(false);
  };

  const handleRestart = () => {
    onRestart();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerElement || (
          <button className="text-blue-600 hover:text-blue-700 font-bold text-sm outline-none transition-colors">
            {t("options")}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl w-full max-h-[85vh] p-0 overflow-hidden flex flex-col rounded-2xl border bg-card">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b flex items-center justify-between">
          <DialogTitle className="text-2xl font-extrabold tracking-tight">
            {t("options")}
          </DialogTitle>
        </DialogHeader>

        {/* Quick toggles row */}
        <div className="px-6 py-4 bg-muted/40 border-b flex items-center gap-3">
          {/* Shuffle Toggle */}
          <button
            onClick={() => setConfig(prev => ({ ...prev, shuffle: !prev.shuffle }))}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              config.shuffle 
                ? "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:border-blue-900" 
                : "bg-background hover:bg-muted border-input text-muted-foreground"
            }`}
          >
            <Shuffle size={16} />
            <span>{t("shuffle")}</span>
          </button>

          {/* Star Toggle */}
          <button
            disabled={!hasStarredTerms}
            onClick={() => setConfig(prev => ({ ...prev, starredOnly: !prev.starredOnly }))}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              !hasStarredTerms 
                ? "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-transparent"
                : config.starredOnly
                  ? "bg-yellow-100 hover:bg-yellow-200 border-yellow-200 text-yellow-700 dark:bg-yellow-950/40 dark:hover:bg-yellow-900/40 dark:border-yellow-900" 
                  : "bg-background hover:bg-muted border-input text-muted-foreground"
            }`}
            title={!hasStarredTerms ? "Gắn sao một số từ để kích hoạt tính năng này" : ""}
          >
            <Star size={16} className={config.starredOnly && hasStarredTerms ? "fill-current text-yellow-500" : ""} />
            <span>{t("starredOnly")}</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setConfig(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
              config.soundEffects 
                ? "bg-blue-100 hover:bg-blue-200 border-blue-200 text-blue-600 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 dark:border-blue-900" 
                : "bg-background hover:bg-muted border-input text-muted-foreground"
            }`}
          >
            <Volume2 size={16} />
            <span>{t("soundEffects")}</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Question Type Accordion */}
          <div className="border rounded-2xl overflow-hidden bg-background">
            <button
              onClick={() => toggleSection("questionType")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-base bg-muted/20 border-b hover:bg-muted/40 transition-colors"
            >
              <span>{t("questionType")}</span>
              {sections.questionType ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {sections.questionType && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm">{t("multipleChoice")}</span>
                  </div>
                  <Switch
                    checked={config.questionTypes.mc}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        questionTypes: { ...prev.questionTypes, mc: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm">{t("written")}</span>
                  </div>
                  <Switch
                    checked={config.questionTypes.written}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        questionTypes: { ...prev.questionTypes, written: checked }
                      }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm">{t("flashcards")}</span>
                  </div>
                  <Switch
                    checked={config.questionTypes.flashcards}
                    onCheckedChange={(checked) => 
                      setConfig(prev => ({
                        ...prev,
                        questionTypes: { ...prev.questionTypes, flashcards: checked }
                      }))
                    }
                  />
                </div>
              </div>
            )}
          </div>

          {/* Answer With Accordion */}
          <div className="border rounded-2xl overflow-hidden bg-background">
            <button
              onClick={() => toggleSection("answerWith")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-base bg-muted/20 border-b hover:bg-muted/40 transition-colors"
            >
              <span>{t("answerWith")}</span>
              {sections.answerWith ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {sections.answerWith && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm">{t("term")}</span>
                  </div>
                  <Switch
                    checked={config.answerWith === "term" || config.answerWith === "both"}
                    onCheckedChange={(checked) => {
                      setConfig(prev => {
                        let val: "term" | "definition" | "both" = "definition";
                        if (checked && prev.answerWith === "definition") val = "both";
                        else if (checked) val = "term";
                        else if (!checked && prev.answerWith === "both") val = "definition";
                        return { ...prev, answerWith: val };
                      });
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold text-sm">{t("definition")}</span>
                  </div>
                  <Switch
                    checked={config.answerWith === "definition" || config.answerWith === "both"}
                    onCheckedChange={(checked) => {
                      setConfig(prev => {
                        let val: "term" | "definition" | "both" = "term";
                        if (checked && prev.answerWith === "term") val = "both";
                        else if (checked) val = "definition";
                        else if (!checked && prev.answerWith === "both") val = "term";
                        return { ...prev, answerWith: val };
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Show Images Accordion */}
          <div className="border rounded-2xl overflow-hidden bg-background opacity-60">
            <button
              onClick={() => toggleSection("showImages")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-base bg-muted/20 border-b hover:bg-muted/40 transition-colors cursor-not-allowed"
            >
              <span className="flex items-center gap-2">
                <span>{t("showImages")}</span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">PREMIUM</span>
              </span>
              {sections.showImages ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {sections.showImages && (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Câu hỏi</span>
                  <Switch checked={false} disabled />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">Các lựa chọn trả lời</span>
                  <Switch checked={false} disabled />
                </div>
              </div>
            )}
          </div>

          {/* Grading Options Accordion */}
          <div className="border rounded-2xl overflow-hidden bg-background">
            <button
              onClick={() => toggleSection("gradingOptions")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-base bg-muted/20 border-b hover:bg-muted/40 transition-colors"
            >
              <span>{t("gradingOptions")}</span>
              {sections.gradingOptions ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {sections.gradingOptions && (
              <div className="p-5 space-y-5">
                {/* Radio list */}
                <div className="space-y-4">
                  {/* Loose */}
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input 
                      type="radio" 
                      name="gradingLevel" 
                      value="loose"
                      checked={config.gradingLevel === "loose"}
                      onChange={() => setConfig(prev => ({ ...prev, gradingLevel: "loose" }))}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm block group-hover:text-blue-600 transition-colors">{t("gradingLoose")}</span>
                      <span className="text-xs text-muted-foreground block leading-relaxed">{t("gradingLooseDesc")}</span>
                    </div>
                  </label>

                  {/* Medium */}
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input 
                      type="radio" 
                      name="gradingLevel" 
                      value="medium"
                      checked={config.gradingLevel === "medium"}
                      onChange={() => setConfig(prev => ({ ...prev, gradingLevel: "medium" }))}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm block group-hover:text-blue-600 transition-colors">{t("gradingMedium")}</span>
                      <span className="text-xs text-muted-foreground block leading-relaxed">{t("gradingMediumDesc")}</span>
                    </div>
                  </label>

                  {/* Strict */}
                  <label className="flex items-start gap-3 cursor-pointer group select-none">
                    <input 
                      type="radio" 
                      name="gradingLevel" 
                      value="strict"
                      checked={config.gradingLevel === "strict"}
                      onChange={() => setConfig(prev => ({ ...prev, gradingLevel: "strict" }))}
                      className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                    />
                    <div className="space-y-1">
                      <span className="font-bold text-sm block group-hover:text-blue-600 transition-colors">{t("gradingStrict")}</span>
                      <span className="text-xs text-muted-foreground block leading-relaxed">{t("gradingStrictDesc")}</span>
                    </div>
                  </label>
                </div>

                <div className="border-t pt-4 space-y-4">
                  {/* Require correct answer */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 pr-4">
                      <span className="font-bold text-sm block">{t("requireCorrectAnswer")}</span>
                      <span className="text-xs text-muted-foreground block leading-relaxed">{t("requireCorrectAnswerDesc")}</span>
                    </div>
                    <Switch
                      checked={config.requireCorrect}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, requireCorrect: checked }))}
                      className="mt-1"
                    />
                  </div>

                  {/* One answer suffices */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1 pr-4">
                      <span className="font-bold text-sm block">{t("oneAnswerSuffices")}</span>
                      <span className="text-xs text-muted-foreground block leading-relaxed">{t("oneAnswerSufficesDesc")}</span>
                    </div>
                    <Switch
                      checked={config.oneAnswerSuffices}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, oneAnswerSuffices: checked }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text to Speech Accordion */}
          <div className="border rounded-2xl overflow-hidden bg-background">
            <button
              onClick={() => toggleSection("textToSpeech")}
              className="w-full px-5 py-4 flex items-center justify-between font-bold text-base bg-muted/20 border-b hover:bg-muted/40 transition-colors"
            >
              <span>{t("textToSpeech")}</span>
              {sections.textToSpeech ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {sections.textToSpeech && (
              <div className="p-5 flex items-center justify-between">
                <span className="font-bold text-sm">Chuyển văn bản thành lời nói</span>
                <Switch
                  checked={config.textToSpeech}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, textToSpeech: checked }))}
                />
              </div>
            )}
          </div>

          {/* Sub menu mode selection options */}
          <div className="space-y-3 pt-2">
            <button 
              onClick={() => {
                toast.info("Đang chuyển đổi sang Chế độ Viết...");
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border rounded-xl font-bold text-sm text-foreground transition-all"
            >
              <span>{t("writeMode")}</span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span>{t("start")}</span>
                <ChevronRight size={16} />
              </span>
            </button>

            <button 
              onClick={() => {
                toast.info("Đang chuyển đổi sang Chế độ Chính tả...");
                setOpen(false);
              }}
              className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 border rounded-xl font-bold text-sm text-foreground transition-all"
            >
              <span>Chế độ Chính tả</span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span>{t("start")}</span>
                <ChevronRight size={16} />
              </span>
            </button>

            <div className="pt-2 text-center">
              <a 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Chính sách quyền riêng tư...");
                }}
                className="text-xs text-muted-foreground hover:text-foreground hover:underline transition-all"
              >
                {t("privacyPolicy")}
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t bg-background flex items-center justify-between">
          <button
            onClick={handleRestart}
            className="text-red-500 hover:text-red-600 font-extrabold text-sm outline-none transition-colors"
          >
            {t("restartLearn")}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(false)}
              className="px-5 py-2.5 rounded-xl border font-bold text-sm hover:bg-muted transition-all text-foreground"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LearnOptionsDialog;
