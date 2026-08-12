"use client";

import { useState, useMemo } from "react";
import { Download, FileText, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Button } from "@acme/ui/button";
import { cn } from "@acme/ui";
import { api } from "~/trpc/react";
import { useTranslation } from "~/contexts/i18n-context";

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studySetId: string;
  title: string;
}

const LEVELS = [
  { level: 0, titleKey: "level0Title" as const, color: "slate" },
  { level: 1, titleKey: "level1Title" as const, color: "red" },
  { level: 2, titleKey: "level2Title" as const, color: "orange" },
  { level: 3, titleKey: "level3Title" as const, color: "yellow" },
  { level: 4, titleKey: "level4Title" as const, color: "lime" },
  { level: 5, titleKey: "level5Title" as const, color: "green" },
  { level: 6, titleKey: "level6Title" as const, color: "emerald" },
  { level: 7, titleKey: "level7Title" as const, color: "blue" },
];

const LEVEL_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  slate:   { bg: "bg-slate-500/20",   border: "border-slate-500",   text: "text-slate-300" },
  red:     { bg: "bg-red-500/20",     border: "border-red-500",     text: "text-red-400" },
  orange:  { bg: "bg-orange-500/20",  border: "border-orange-500",  text: "text-orange-400" },
  yellow:  { bg: "bg-yellow-500/20",  border: "border-yellow-500",  text: "text-yellow-400" },
  lime:    { bg: "bg-lime-500/20",    border: "border-lime-500",    text: "text-lime-400" },
  green:   { bg: "bg-green-500/20",   border: "border-green-500",   text: "text-green-400" },
  emerald: { bg: "bg-emerald-500/20", border: "border-emerald-500", text: "text-emerald-400" },
  blue:    { bg: "bg-blue-500/20",    border: "border-blue-500",    text: "text-blue-400" },
};

type FilterMode = "all" | "starred" | number;

const ExportDialog = ({ open, onOpenChange, studySetId, title }: ExportDialogProps) => {
  const { t } = useTranslation();
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [isExporting, setIsExporting] = useState(false);

  const { data: studySet } = api.studySet.byId.useQuery({ id: studySetId }, { enabled: open });
  const { data: studyProgress } = api.studyProgress.getProgress.useQuery({ studySetId }, { enabled: open });

  const flashcards = studySet?.flashcards ?? [];

  // Count per level
  const levelCounts = useMemo(() => {
    if (!flashcards.length || !studyProgress) return new Map<number, number>();
    const progressMap = new Map(studyProgress.map((p) => [p.flashcardId, p]));
    const counts = new Map<number, number>();
    for (const card of flashcards) {
      const p = progressMap.get(card.id);
      const level = p ? Math.min(p.srsStep || 0, 7) : 0;
      counts.set(level, (counts.get(level) || 0) + 1);
    }
    return counts;
  }, [flashcards, studyProgress]);

  // Starred count
  const starredCount = flashcards.filter((f) => f.starred).length;

  // Filter flashcards
  const getFilteredCards = () => {
    if (filterMode === "starred") {
      return flashcards.filter((f) => f.starred);
    }
    if (typeof filterMode === "number") {
      if (!studyProgress) return [];
      const progressMap = new Map(studyProgress.map((p) => [p.flashcardId, p]));
      return flashcards.filter((card) => {
        const p = progressMap.get(card.id);
        const level = p ? Math.min(p.srsStep || 0, 7) : 0;
        return level === filterMode;
      });
    }
    return flashcards;
  };

  const exportWord = async () => {
    setIsExporting(true);
    try {
      const cards = getFilteredCards();
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, BorderStyle } = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: any[] = [];

      // Title
      children.push(
        new Paragraph({
          text: title,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 300 },
        })
      );

      cards.forEach((card, idx) => {
        // Question number
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}:`, bold: true, size: 24 }),
            ],
            spacing: { before: 300, after: 100 },
          })
        );

        // Term (question) - split by newlines
        const termLines = card.term.split("\n");
        termLines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 24 })],
              spacing: { after: 40 },
            })
          );
        });

        // Definition (answer)
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Đáp án: ", bold: true, size: 24 }),
              new TextRun({ text: card.definition, size: 24, color: "2563EB" }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );

        // Separator
        children.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
            spacing: { after: 200 },
          })
        );
      });

      const doc = new Document({
        sections: [{ children }],
      });

      const blob = await Packer.toBlob(doc);
      const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF\s]/g, "").trim() || "export";
      saveAs(blob, `${safeName}_export.docx`);
    } catch (e) {
      console.error("Export Word error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const cards = getFilteredCards();
      const { jsPDF } = await import("jspdf");

      // Load fonts
      const [timesRes, kaitiRes] = await Promise.all([
        fetch("/fonts/times-new-roman.ttf"),
        fetch("/fonts/kaiti.ttf"),
      ]);

      const doc = new jsPDF({ unit: "mm", format: "a4" });

      if (timesRes.ok) {
        const timesBuffer = await timesRes.arrayBuffer();
        const timesBase64 = btoa(
          new Uint8Array(timesBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        doc.addFileToVFS("TimesNewRoman.ttf", timesBase64);
        doc.addFont("TimesNewRoman.ttf", "TimesNewRoman", "normal");
      }

      if (kaitiRes.ok) {
        const kaitiBuffer = await kaitiRes.arrayBuffer();
        const kaitiBase64 = btoa(
          new Uint8Array(kaitiBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
        );
        doc.addFileToVFS("KaiTi.ttf", kaitiBase64);
        doc.addFont("KaiTi.ttf", "KaiTi", "normal");
      }

      // Detect if text contains CJK characters
      const hasCJK = (text: string) => /[\u4E00-\u9FFF\u3400-\u4DBF]/.test(text);

      const setFont = (text: string) => {
        if (hasCJK(text) && kaitiRes.ok) {
          doc.setFont("KaiTi");
        } else if (timesRes.ok) {
          doc.setFont("TimesNewRoman");
        }
      };

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      // Title
      setFont(title);
      doc.setFontSize(18);
      doc.setFont(doc.getFont().fontName, "bold");
      const titleLines = doc.splitTextToSize(title, maxWidth);
      doc.text(titleLines, margin, y);
      y += titleLines.length * 8 + 6;

      doc.setFontSize(12);

      cards.forEach((card, idx) => {
        // Check page break
        const termLines = doc.splitTextToSize(card.term, maxWidth);
        const defLines = doc.splitTextToSize(`Đáp án: ${card.definition}`, maxWidth);
        const blockHeight = (termLines.length + defLines.length + 2) * 6 + 14;

        if (y + blockHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        // Question number
        setFont(`Câu ${idx + 1}:`);
        doc.setFont(doc.getFont().fontName, "bold");
        doc.text(`Câu ${idx + 1}:`, margin, y);
        y += 6;

        // Term
        setFont(card.term);
        doc.setFont(doc.getFont().fontName, "normal");
        doc.text(termLines, margin, y);
        y += termLines.length * 6 + 4;

        // Definition
        const answerLabel = "Đáp án: ";
        setFont(answerLabel + card.definition);
        doc.setFont(doc.getFont().fontName, "bold");
        doc.setTextColor(37, 99, 235); // blue
        doc.text(answerLabel, margin, y);
        const labelWidth = doc.getTextWidth(answerLabel);
        doc.setFont(doc.getFont().fontName, "normal");
        doc.text(defLines, margin, y);
        y += defLines.length * 6 + 4;

        // Reset color
        doc.setTextColor(0, 0, 0);

        // Separator line
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;
      });

      const safeName = title.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF\s]/g, "").trim() || "export";
      doc.save(`${safeName}_export.pdf`);
    } catch (e) {
      console.error("Export PDF error:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const filteredCount = filterMode === "all"
    ? flashcards.length
    : filterMode === "starred"
      ? starredCount
      : (levelCounts.get(filterMode as number) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-0 overflow-hidden flex flex-col rounded-3xl border bg-card">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="text-xl font-extrabold tracking-tight">
            📥 Xuất file
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Chọn nội dung cần xuất ({filteredCount} câu)
          </p>
        </DialogHeader>

        {/* Filter options */}
        <div className="px-6 pb-4 space-y-3">
          {/* All + Starred */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterMode("all")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all",
                filterMode === "all"
                  ? "border-indigo-500 bg-indigo-500/20 text-indigo-400"
                  : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              Tất cả ({flashcards.length})
            </button>
            <button
              onClick={() => starredCount > 0 && setFilterMode("starred")}
              disabled={starredCount === 0}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold border-2 transition-all flex items-center gap-1",
                filterMode === "starred"
                  ? "border-amber-500 bg-amber-500/20 text-amber-400"
                  : starredCount === 0
                    ? "border-border bg-background text-muted-foreground/40 cursor-not-allowed opacity-50"
                    : "border-border bg-background text-muted-foreground hover:bg-muted/50"
              )}
            >
              <Star size={14} /> Gắn sao ({starredCount})
            </button>
          </div>

          {/* Level filters */}
          <div className="grid grid-cols-4 gap-2">
            {LEVELS.map(({ level, titleKey, color }) => {
              const count = levelCounts.get(level) || 0;
              const colorSet = LEVEL_COLORS[color]!;
              const isActive = filterMode === level;
              const isDisabled = count === 0;

              return (
                <button
                  key={level}
                  onClick={() => !isDisabled && setFilterMode(level)}
                  disabled={isDisabled}
                  className={cn(
                    "px-2 py-2 rounded-xl text-xs font-bold border-2 transition-all flex flex-col items-center gap-0.5",
                    isActive
                      ? `${colorSet.border} ${colorSet.bg} ${colorSet.text}`
                      : isDisabled
                        ? "border-border bg-background text-muted-foreground/30 cursor-not-allowed opacity-40"
                        : `border-border bg-background ${colorSet.text} hover:${colorSet.bg} hover:${colorSet.border}`
                  )}
                >
                  <span>LV {level}</span>
                  <span className="text-[10px] opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Export buttons */}
        <div className="p-6 pt-2 flex gap-3">
          <Button
            onClick={exportWord}
            disabled={isExporting || filteredCount === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-12"
          >
            <FileText size={18} className="mr-2" />
            Word (.docx)
          </Button>
          <Button
            onClick={exportPDF}
            disabled={isExporting || filteredCount === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12"
          >
            <Download size={18} className="mr-2" />
            PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;
