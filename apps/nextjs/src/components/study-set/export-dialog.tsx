"use client";

import { useState, useMemo, useRef } from "react";
import { Download, FileText, Star, Printer } from "lucide-react";
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

  // ─── EXPORT WORD ───
  const exportWord = async () => {
    setIsExporting(true);
    try {
      const cards = getFilteredCards();
      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = await import("docx");
      const { saveAs } = await import("file-saver");

      const children: (InstanceType<typeof Paragraph>)[] = [];

      // Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: title, bold: true, size: 32, font: "Times New Roman" }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 200 },
        })
      );

      cards.forEach((card, idx) => {
        // Question number
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Câu ${idx + 1}:`, bold: true, size: 24, font: "Times New Roman" }),
            ],
            spacing: { before: 240, after: 80 },
          })
        );

        // Term (question) - split by newlines
        const termLines = card.term.split("\n");
        termLines.forEach((line) => {
          children.push(
            new Paragraph({
              children: [new TextRun({ text: line, size: 24, font: "Times New Roman" })],
              spacing: { after: 40 },
            })
          );
        });

        // Definition (answer)
        const defLines = card.definition.split("\n");
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: "Đáp án: ", bold: true, size: 24, font: "Times New Roman" }),
              new TextRun({ text: defLines[0] || "", size: 24, font: "Times New Roman", color: "2563EB", bold: true }),
            ],
            spacing: { before: 80, after: 80 },
          })
        );

        // Extra definition lines if any
        for (let i = 1; i < defLines.length; i++) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({ text: defLines[i] || "", size: 24, font: "Times New Roman", color: "2563EB" }),
              ],
              spacing: { after: 40 },
            })
          );
        }

        // Separator
        children.push(
          new Paragraph({
            border: {
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
            },
            spacing: { after: 160 },
          })
        );
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 720, right: 720, bottom: 720, left: 720 },
            },
          },
          children,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const safeName = title.replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF\u4E00-\u9FFF\s]/g, "").trim() || "export";
      saveAs(blob, `${safeName}_export.docx`);
    } catch (e) {
      console.error("Export Word error:", e);
      alert("Lỗi khi xuất file Word. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  // ─── EXPORT PDF (via browser print) ───
  const exportPDF = () => {
    const cards = getFilteredCards();
    
    // Build HTML content
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @page { margin: 15mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Times New Roman', 'Noto Serif', serif;
      font-size: 13pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    h1 {
      font-size: 20pt;
      font-weight: bold;
      margin-bottom: 16px;
      border-bottom: 2px solid #333;
      padding-bottom: 8px;
    }
    .card {
      page-break-inside: avoid;
      margin-bottom: 12px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    .card-num {
      font-weight: bold;
      font-size: 13pt;
      margin-bottom: 4px;
    }
    .card-term {
      white-space: pre-wrap;
      margin-bottom: 6px;
    }
    .card-answer {
      color: #2563EB;
      font-weight: bold;
    }
    .card-answer-label {
      color: #1a1a1a;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  ${cards.map((card, idx) => `
    <div class="card">
      <div class="card-num">Câu ${idx + 1}:</div>
      <div class="card-term">${escapeHtml(card.term)}</div>
      <div>
        <span class="card-answer-label">Đáp án: </span>
        <span class="card-answer">${escapeHtml(card.definition)}</span>
      </div>
    </div>
  `).join("")}
</body>
</html>`;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại.");
      return;
    }
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to render then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 300);
    };
    // Fallback if onload doesn't fire
    setTimeout(() => {
      printWindow.print();
    }, 1000);
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
            disabled={filteredCount === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl h-12"
          >
            <Printer size={18} className="mr-2" />
            PDF (In)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\n/g, "<br>");
}

export default ExportDialog;
