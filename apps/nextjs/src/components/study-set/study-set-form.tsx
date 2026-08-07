"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Reorder } from "framer-motion";
import { LoaderCircle, PlusIcon, Trash2Icon } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import type { StudySetValues } from "@acme/validators";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader } from "@acme/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFieldArray,
  useForm,
} from "@acme/ui/form";
import { Input } from "@acme/ui/input";
import { Label } from "@acme/ui/label";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { StudySetSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import StudySetImportDialog from "./study-set-import-dialog";
import { useTranslation } from "~/contexts/i18n-context";

const initialFlashcards = Array.from({ length: 4 }, (_, index) => ({
  term: "",
  definition: "",
  position: index,
}));

interface StudySetFormProps {
  defaultValues?: RouterOutputs["studySet"]["byId"];
}

const StudySetForm = ({ defaultValues }: StudySetFormProps) => {
  const { t } = useTranslation();
  const form = useForm({
    schema: StudySetSchema,
    defaultValues: {
      id: defaultValues?.id,
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      flashcards: defaultValues?.flashcards ?? initialFlashcards,
    },
  });
  const { fields, append, remove, swap } = useFieldArray({
    name: "flashcards",
    control: form.control,
    keyName: "fieldId",
  });
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const utils = api.useUtils();
  const create = api.studySet.create.useMutation({
    onSuccess() {
      form.reset({});
      toast.success(defaultValues ? t("saveSetBtn") : t("createSetBtn"));
      void utils.studySet.invalidate();

      const route = defaultValues
        ? `/study-sets/${defaultValues.id}`
        : "/latest";

      router.push(route);
    },
    onError(error) {
      toast.error(error.message);
    },
  });
  const [isInitialRender, setIsInitialRender] = useState(true);
  const [active, setActive] = useState(0);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [showFloatingBtn, setShowFloatingBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowFloatingBtn(true);
      } else {
        setShowFloatingBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const autoFormatQuestion = (text: string) => {
    if (!text) return text;
    // Chèn xuống dòng trước các đáp án A., B., C., D. hoặc A), B), C), D) (bất kể hoa/thường)
    // nếu trước đó chưa có dấu xuống dòng
    let formatted = text.replace(/\s+([A-Da-d1-4][\.\)])\s*/g, '\n$1 ');
    // Chuẩn hóa và làm sạch khoảng trắng
    return formatted
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join('\n');
  };

  const handleImport = (
    importedCards: { term: string; definition: string }[],
    mode: "replace" | "append",
  ) => {
    const currentCards = form.getValues("flashcards") || [];

    const formattedNewCards = importedCards.map((card, idx) => ({
      term: autoFormatQuestion(card.term),
      definition: autoFormatQuestion(card.definition),
      position: mode === "replace" ? idx : currentCards.length + idx,
    }));

    if (mode === "replace") {
      form.setValue("flashcards", formattedNewCards);
    } else {
      // Filter out empty cards at the end if the user has blank cards
      const activeCards = currentCards.filter(
        (c) => c.term.trim() !== "" || c.definition.trim() !== "",
      );

      const combined = [...activeCards, ...formattedNewCards].map(
        (card, idx) => ({
          ...card,
          position: idx,
        }),
      );

      form.setValue("flashcards", combined);
    }

    toast.success(`Đã nhập thành công ${importedCards.length} thẻ!`);
  };

  useEffect(() => {
    if (isInitialRender) {
      setIsInitialRender(false);
      return;
    }

    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [fields.length]);

  const onSubmit = (values: StudySetValues) => {
    const flashcards = values.flashcards.map((flashcard, index) => ({
      ...flashcard,
      term: autoFormatQuestion(flashcard.term),
      definition: autoFormatQuestion(flashcard.definition),
      position: index,
    }));

    create.mutate({
      ...values,
      flashcards,
    });
  };

  const addFlashcard = () => {
    append({
      term: "",
      definition: "",
      position: fields.length,
    });
  };

  const swapCards = (from: number, to: number) => {
    swap(from, to);
  };

  return (
    <div ref={ref} className="m-auto max-w-xl py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    disabled={create.isPending}
                    placeholder="Mathematics"
                    {...field}
                  />
                </FormControl>
                <FormDescription>This is your study set title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={create.isPending}
                    placeholder="Addition learning set..."
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  This is your study set description.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label
                className={cn({
                  "text-destructive": form.formState.errors.flashcards?.root,
                })}
              >
                Flashcards
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsImportOpen(true)}
              >
                + Nhập nhanh (Import)
              </Button>
            </div>
            {form.formState.errors.flashcards?.root && (
              <p className="text-[0.8rem] font-medium text-destructive mb-2">
                {form.formState.errors.flashcards.root.message}
              </p>
            )}
            <Reorder.Group
              axis="y"
              values={fields}
              onReorder={(newOrder) => {
                const activeElement = fields[active];
                newOrder.forEach((item, index) => {
                  if (item === activeElement) {
                    swapCards(active, index);
                    setActive(index);
                  }
                });
              }}
              className="mt-2 flex flex-col gap-8"
            >
              {fields.map((field, index) => (
                <Reorder.Item
                  key={field.fieldId}
                  value={field}
                  onDragStart={() => setActive(index)}
                >
                  <Card>
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <span>{index + 1}</span>
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2Icon size={16} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex gap-4">
                      <FormField
                        control={form.control}
                        name={`flashcards.${index}.term`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Term</FormLabel>
                            <FormControl>
                              <div
                                data-value={field.value}
                                className="grid after:invisible after:whitespace-pre-wrap after:border after:py-2 after:text-sm after:content-[attr(data-value)_'\n'] after:[grid-area:1/1]"
                              >
                                <Textarea
                                  disabled={create.isPending}
                                  placeholder="2+2"
                                  {...field}
                                  className="min-h-10 resize-none [grid-area:1/1]"
                                  rows={1}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`flashcards.${index}.definition`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Definition</FormLabel>
                            <FormControl>
                              <div
                                data-value={field.value}
                                className="grid after:invisible after:whitespace-pre-wrap after:border after:py-2 after:text-sm after:content-[attr(data-value)_'\n'] after:[grid-area:1/1]"
                              >
                                <Textarea
                                  disabled={create.isPending}
                                  placeholder="4"
                                  {...field}
                                  className="min-h-10 resize-none [grid-area:1/1]"
                                  rows={1}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>
                </Reorder.Item>
              ))}
            </Reorder.Group>
            <Button
              type="button"
              onClick={addFlashcard}
              className="mt-8 w-full"
              variant="outline"
            >
              <PlusIcon className="mr-2 size-4" />
              Add flashcard
            </Button>
          </div>
          <Button
            disabled={create.isPending}
            type="submit"
            className="w-full"
            size="lg"
          >
            {create.isPending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <>{defaultValues ? t("saveSetBtn") : t("createSetBtn")}</>
            )}
          </Button>

          {/* Nút nổi hoàn thành tạo học phần ở góc màn hình khi cuộn trang */}
          {showFloatingBtn && (
            <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button
                disabled={create.isPending}
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-5 rounded-full shadow-[0_10px_30px_rgba(37,99,235,0.45)] flex items-center gap-2 border-2 border-blue-400 cursor-pointer active:scale-95 transition-all text-sm md:text-base h-auto"
              >
                {create.isPending ? (
                  <LoaderCircle size={20} className="animate-spin" />
                ) : (
                  <>
                    <span className="text-lg">✨</span>
                    <span>
                      {defaultValues
                        ? t("saveSetBtn")
                        : t("createSetBtn")}
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>
      <StudySetImportDialog
        open={isImportOpen}
        onOpenChange={setIsImportOpen}
        onImport={handleImport}
      />
    </div>
  );
};

export default StudySetForm;
