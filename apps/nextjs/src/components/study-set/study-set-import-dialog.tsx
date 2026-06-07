"use client";

import { useState } from "react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";

interface StudySetImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (
    cards: { term: string; definition: string }[],
    mode: "replace" | "append",
  ) => void;
}

export default function StudySetImportDialog({
  open,
  onOpenChange,
  onImport,
}: StudySetImportDialogProps) {
  const [text, setText] = useState("");
  const [termSep, setTermSep] = useState("tab"); // "tab", "comma", "dash", "custom"
  const [customTermSep, setCustomTermSep] = useState("");
  const [rowSep, setRowSep] = useState("newline"); // "newline", "semicolon", "custom"
  const [customRowSep, setCustomRowSep] = useState("");
  const [importMode, setImportMode] = useState<"replace" | "append">("append");

  const handleImportSubmit = () => {
    if (!text.trim()) return;

    let actualTermSep = "\t";
    if (termSep === "comma") actualTermSep = ",";
    else if (termSep === "dash") actualTermSep = "-";
    else if (termSep === "custom") actualTermSep = customTermSep;

    let actualRowSep = "\n";
    if (rowSep === "semicolon") actualRowSep = ";";
    else if (rowSep === "custom") actualRowSep = customRowSep;

    if (!actualTermSep) actualTermSep = "\t";
    if (!actualRowSep) actualRowSep = "\n";

    // Split rows
    const rows = text.split(actualRowSep);
    const parsedCards: { term: string; definition: string }[] = [];

    for (const row of rows) {
      const trimmedRow = row.trim();
      if (!trimmedRow) continue;

      const parts = trimmedRow.split(actualTermSep);
      if (parts.length >= 2) {
        const term = parts[0]!.trim();
        const definition = parts.slice(1).join(actualTermSep).trim();
        if (term || definition) {
          parsedCards.push({ term, definition });
        }
      } else if (parts.length === 1 && parts[0]!.trim()) {
        parsedCards.push({ term: parts[0]!.trim(), definition: "" });
      }
    }

    if (parsedCards.length > 0) {
      onImport(parsedCards, importMode);
      setText("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nhập nhanh bộ đề (Quick Import)</DialogTitle>
          <DialogDescription>
            Sao chép và dán danh sách từ vựng của bạn từ Excel, Google Sheets, Word hoặc file text vào ô dưới đây.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Textarea dán từ vựng */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="import-text">Dán văn bản vào đây:</Label>
            <Textarea
              id="import-text"
              placeholder={`Ví dụ (sử dụng dấu Tab):\napple\tquả táo\nbanana\tquả chuối`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[180px] font-mono text-sm"
            />
          </div>

          {/* Cấu hình phân tách giữa Term & Definition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Phân tách giữa Từ và Nghĩa:</Label>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={termSep === "tab" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTermSep("tab")}
                >
                  Tab (Excel)
                </Button>
                <Button
                  type="button"
                  variant={termSep === "comma" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTermSep("comma")}
                >
                  Dấu phẩy (,)
                </Button>
                <Button
                  type="button"
                  variant={termSep === "dash" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTermSep("dash")}
                >
                  Gạch ngang (-)
                </Button>
                <Button
                  type="button"
                  variant={termSep === "custom" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setTermSep("custom")}
                >
                  Khác
                </Button>
              </div>
              {termSep === "custom" && (
                <Input
                  placeholder="Nhập ký tự phân tách..."
                  value={customTermSep}
                  onChange={(e) => setCustomTermSep(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              )}
            </div>

            {/* Cấu hình phân tách giữa các Hàng */}
            <div className="flex flex-col gap-2">
              <Label>Phân tách giữa các thẻ:</Label>
              <div className="flex flex-wrap gap-1">
                <Button
                  type="button"
                  variant={rowSep === "newline" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setRowSep("newline")}
                >
                  Xuống dòng
                </Button>
                <Button
                  type="button"
                  variant={rowSep === "semicolon" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setRowSep("semicolon")}
                >
                  Chấm phẩy (;)
                </Button>
                <Button
                  type="button"
                  variant={rowSep === "custom" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setRowSep("custom")}
                >
                  Khác
                </Button>
              </div>
              {rowSep === "custom" && (
                <Input
                  placeholder="Nhập ký tự phân tách..."
                  value={customRowSep}
                  onChange={(e) => setCustomRowSep(e.target.value)}
                  className="mt-1 h-8 text-sm"
                />
              )}
            </div>
          </div>

          {/* Lựa chọn chế độ nhập đè / nối tiếp */}
          <div className="flex flex-col gap-2">
            <Label>Chế độ nhập:</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={importMode === "append" ? "primary" : "outline"}
                size="sm"
                onClick={() => setImportMode("append")}
                className="flex-1"
              >
                Thêm tiếp vào cuối (Append)
              </Button>
              <Button
                type="button"
                variant={importMode === "replace" ? "primary" : "outline"}
                size="sm"
                onClick={() => setImportMode("replace")}
                className="flex-1"
              >
                Thay thế toàn bộ (Replace)
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
          <Button
            type="button"
            onClick={handleImportSubmit}
            disabled={!text.trim()}
          >
            Nhập dữ liệu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
