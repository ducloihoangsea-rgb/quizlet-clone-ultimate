import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import type { SelectFlashcard } from "@acme/db/schema";
import { eq, inArray } from "@acme/db";
import {
  createStudySet,
  deleteExcludedFlashcards,
  deleteStudySet,
  upsertFlashcards,
} from "@acme/db/mutations";
import {
  getLatestStudySets,
  getOtherStudySets,
  getPopularStudySetsQuery,
  getStarredFlashcardsQuery,
  getStudySetFlashcardsQuery,
  getStudySetQuery,
  getStudySetWithFlashcardsQuery,
  getUserStudySetsQuery,
} from "@acme/db/queries";
import { Flashcard, Folder, FoldersToStudySets } from "@acme/db/schema";
import { StudySetSchema } from "@acme/validators";

import type { TRPCContext } from "../trpc";
import { protectedProcedure, publicProcedure } from "../trpc";

const getStarredFlashcards = async (ctx: TRPCContext, studySetId: string) => {
  if (ctx.session) {
    return await getStarredFlashcardsQuery(ctx.db, {
      studySetId,
      userId: ctx.session.user.id,
    });
  }

  return [];
};

const generateMultipleChoiceCards = (
  flashcards: SelectFlashcard[],
  pool: SelectFlashcard[],
) => {
  return flashcards.map((card) => {
    // Trích xuất các phương án trắc nghiệm A, B, C, D từ term
    const extractMultipleChoice = (text: string) => {
      const regexA = /(?:^|\n)\s*([A|a][\.\)\-:\s]+[^\n]+)/;
      const regexB = /(?:^|\n)\s*([B|b][\.\)\-:\s]+[^\n]+)/;
      const regexC = /(?:^|\n)\s*([C|c][\.\)\-:\s]+[^\n]+)/;
      const regexD = /(?:^|\n)\s*([D|d][\.\)\-:\s]+[^\n]+)/;

      const a = text.match(regexA)?.[1]?.trim();
      const b = text.match(regexB)?.[1]?.trim();
      const c = text.match(regexC)?.[1]?.trim();
      const d = text.match(regexD)?.[1]?.trim();

      const options = [a, b, c, d].filter(Boolean) as string[];
      if (options.length >= 2) {
        return options;
      }
      return null;
    };

    const cleanText = (str: string) => {
      return str
        .replace(/^[a-zA-Z][\.\)\-:\s]+/, "") // loại bỏ tiền tố A., B), C:,...
        .trim()
        .toLowerCase();
    };

    const choices = extractMultipleChoice(card.term);
    let answers: string[] = [];
    let updatedDefinition = card.definition;

    if (choices) {
      // Vì là trắc nghiệm tự soạn nên ta giữ nguyên thứ tự A, B, C, D
      answers = choices;

      // Tìm phương án đúng trong choices khớp với definition
      let matchedChoice = choices.find(
        (choice) => cleanText(choice) === cleanText(card.definition)
      );

      if (!matchedChoice) {
        // Nếu không khớp hoàn toàn, kiểm tra xem có chứa nhau không
        matchedChoice = choices.find((choice) => {
          const cleanC = cleanText(choice);
          const cleanD = cleanText(card.definition);
          return cleanC.includes(cleanD) || cleanD.includes(cleanC);
        });
      }

      if (!matchedChoice) {
        // Nếu definition chỉ là chữ cái (A, B, C, D)
        const firstLetter = card.definition.trim().charAt(0).toUpperCase();
        if (["A", "B", "C", "D"].includes(firstLetter)) {
          matchedChoice = choices.find((choice) =>
            choice.trim().toUpperCase().startsWith(firstLetter)
          );
        }
      }

      if (matchedChoice) {
        updatedDefinition = matchedChoice;
      }
    } else {
      // Nếu không phải câu hỏi trắc nghiệm tự soạn, bốc ngẫu nhiên định nghĩa các câu khác
      const falseAnswers = pool
        .filter(({ id }) => id !== card.id)
        .sort(() => 0.5 - Math.random())
        .map((card) => card.definition)
        .slice(0, 3);

      answers = [...falseAnswers, card.definition].sort(
        () => 0.5 - Math.random()
      );
    }

    return {
      ...card,
      definition: updatedDefinition,
      answers,
    };
  });
};

export const studySetRouter = {
  popular: publicProcedure.query(async ({ ctx }) => {
    return await getPopularStudySetsQuery(ctx.db);
  }),
  latest: publicProcedure.query(async ({ ctx }) => {
    return await getLatestStudySets(ctx.db);
  }),
  allByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getUserStudySetsQuery(ctx.db, input.userId);
    }),
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const studySet = await getStudySetWithFlashcardsQuery(ctx.db, input.id);

      if (!studySet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Study set with provided id not found",
        });
      }

      const starredFlashcards = await getStarredFlashcards(ctx, input.id);

      let progressMap = new Map();
      if (ctx.session) {
        const userId = ctx.session.user.id;
        const progressList = await ctx.db.query.StudyProgress.findMany({
          where: (p, { inArray }) => 
            inArray(p.flashcardId, studySet.flashcards.map(f => f.id)),
        });
        progressMap = new Map(progressList.filter(p => p.userId === userId).map(p => [p.flashcardId, p]));
      }

      const updatedFlashcards = studySet.flashcards.map((flashcard) => ({
        ...flashcard,
        starred: starredFlashcards.some(({ id }) => id === flashcard.id),
        progress: progressMap.get(flashcard.id) ?? null,
      }));

      // TODO: Get only session.user folders of this set
      const allFolders = await ctx.db
        .select({ id: Folder.id })
        .from(Folder)
        .leftJoin(
          FoldersToStudySets,
          eq(Folder.id, FoldersToStudySets.folderId),
        )
        .where(eq(FoldersToStudySets.studySetId, studySet.id));

      return {
        ...studySet,
        flashcards: updatedFlashcards,
        folders: allFolders,
      };
    }),
  other: publicProcedure
    .input(z.object({ studySetId: z.string(), userId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await getOtherStudySets(ctx.db, input);
    }),
  create: protectedProcedure
    .input(StudySetSchema)
    .mutation(async ({ input, ctx }) => {
      const { id, title, description, flashcards } = input;

      const result = await ctx.db.transaction(async (tx) => {
        const newStudySet = await createStudySet(tx, {
          id,
          title,
          description,
          userId: ctx.session.user.id,
        });

        if (!newStudySet) {
          return null;
        }

        const values = flashcards.map((flashcard) => ({
          ...flashcard,
          studySetId: newStudySet.id,
        }));

        if (id) {
          const present = flashcards
            .map((card) => card.id)
            .filter((i) => i !== undefined);

          await deleteExcludedFlashcards(tx, {
            studySetId: newStudySet.id,
            flashcards: present,
          });
        }

        await upsertFlashcards(tx, values);

        return newStudySet;
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create study set",
        });
      }

      return result;
    }),
  combine: protectedProcedure
    .input(z.object({ id: z.string(), studySets: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const studySet = await getStudySetQuery(ctx.db, input.id);

      if (!studySet) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const flashcards = await ctx.db.query.Flashcard.findMany({
        where: inArray(Flashcard.studySetId, [studySet.id, ...input.studySets]),
      });

      const result = await ctx.db.transaction(async (tx) => {
        const newStudySet = await createStudySet(tx, {
          title: studySet.title,
          description: studySet.description,
          userId: ctx.session.user.id,
        });

        if (!newStudySet) {
          return null;
        }

        const values = flashcards.map((card, index) => ({
          position: index + 1,
          studySetId: newStudySet.id,
          term: card.term,
          definition: card.definition,
        }));

        await upsertFlashcards(tx, values);

        return newStudySet;
      });

      if (!result) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create study set",
        });
      }

      return result;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteStudySet(ctx.db, input.id);
    }),
  matchCards: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const flashcards = await getStudySetFlashcardsQuery(ctx.db, input.id, {
        limit: 4,
        random: true,
      });

      const matchCards = flashcards
        .map((card) => [
          { flashcardId: card.id, content: card.term },
          { flashcardId: card.id, content: card.definition },
        ])
        .flat()
        .sort(() => 0.5 - Math.random());

      return matchCards;
    }),
  learnCards: publicProcedure
    .input(z.object({ 
      id: z.string(),
      goal: z.enum(["cramming", "spaced_repetition"]).optional(),
      level: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const flashcards = await getStudySetFlashcardsQuery(ctx.db, input.id);
      
      let dueCards = flashcards;
      
      if (ctx.session) {
        const userId = ctx.session.user.id;
        // Lấy tiến độ SRS
        const progressList = await ctx.db.query.StudyProgress.findMany({
          where: (p, { eq, inArray }) => 
            inArray(p.flashcardId, flashcards.map(f => f.id)),
        });
        const progressMap = new Map(progressList.filter(p => p.userId === userId).map(p => [p.flashcardId, p]));
        
        const now = new Date();
        dueCards = flashcards.filter(card => {
          if (input.goal === "cramming") return true;
          
          const p = progressMap.get(card.id);
          
          if (input.level !== undefined) {
            const cardLevel = p ? Math.min(p.srsStep || 0, 7) : 0;
            if (cardLevel !== input.level) return false;
          }

          if (!p) return true; // Thẻ mới
          if (new Date(p.nextReviewDate) <= now) return true; // Tới hạn ôn tập
          return false;
        });

        if (input.goal === "cramming") {
          // Ưu tiên thẻ chưa học (unseen) hoặc thẻ có level thấp (thường trả lời sai)
          dueCards.sort((a, b) => {
             const pA = progressMap.get(a.id);
             const pB = progressMap.get(b.id);
             if (!pA && !pB) return 0;
             if (!pA) return -1;
             if (!pB) return 1;
             return pA.srsStep - pB.srsStep;
          });
        }

      }

      if (dueCards.length === 0) return [];

      const cards = generateMultipleChoiceCards(dueCards, flashcards);

      const starredFlashcards = await getStarredFlashcards(ctx, input.id);

      return cards.map((card) => ({
        ...card,
        starred: starredFlashcards.some(({ id }) => id === card.id),
      }));
    }),
  testCards: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional(),
        answerWith: z.enum(["term", "definition", "both"]).optional(),
        types: z.array(z.string()).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const flashcards = await getStudySetFlashcardsQuery(ctx.db, input.id);
      if (flashcards.length === 0) {
        return {
          trueOrFalse: [],
          written: [],
          multipleChoice: [],
        };
      }

      // 1. Trộn ngẫu nhiên danh sách thẻ
      let pool = [...flashcards].sort(() => 0.5 - Math.random());

      // 2. Giới hạn số lượng câu hỏi theo limit (nếu có)
      const limit =
        input.limit && input.limit > 0 && input.limit <= pool.length
          ? input.limit
          : pool.length;
      let selectedCards = pool.slice(0, limit);

      // 3. Xử lý answerWith (hoán đổi term và definition nếu trả lời bằng term)
      selectedCards = selectedCards.map((card) => {
        let displayTerm = card.term;
        let displayDefinition = card.definition;

        // Kiểm tra xem thẻ có phải là câu hỏi trắc nghiệm có sẵn (A, B, C...) không
        const isSelfAuthoredMC = (() => {
          const a = !!card.term.match(/(?:^|\n)\s*([A|a][\.\)\-:\s]+[^\n]+)/);
          const b = !!card.term.match(/(?:^|\n)\s*([B|b][\.\)\-:\s]+[^\n]+)/);
          const c = !!card.term.match(/(?:^|\n)\s*([C|c][\.\)\-:\s]+[^\n]+)/);
          const d = !!card.term.match(/(?:^|\n)\s*([D|d][\.\)\-:\s]+[^\n]+)/);
          return [a, b, c, d].filter(Boolean).length >= 2;
        })();

        if (!isSelfAuthoredMC) {
          if (input.answerWith === "term") {
            displayTerm = card.definition;
            displayDefinition = card.term;
          } else if (input.answerWith === "both") {
            // Ngẫu nhiên 50% hoán đổi
            if (Math.random() < 0.5) {
              displayTerm = card.definition;
              displayDefinition = card.term;
            }
          }
        }

        return {
          ...card,
          term: displayTerm,
          definition: displayDefinition,
        };
      });

      // 4. Xác định các loại câu hỏi được chọn
      // Mặc định nếu types không được cung cấp hoặc rỗng, ta sử dụng cả 3 loại
      const activeTypes =
        input.types && input.types.length > 0
          ? input.types
          : ["mc", "written", "trueFalse"];

      const typeCount = activeTypes.length;
      const cardsPerType = Math.floor(selectedCards.length / typeCount);
      let copy = [...selectedCards];

      let multipleChoice: any[] = [];
      let written: any[] = [];
      let trueOrFalse: any[] = [];

      if (activeTypes.includes("mc")) {
        const isLast = activeTypes.indexOf("mc") === typeCount - 1;
        const mcCount = isLast ? copy.length : cardsPerType;
        const mcCards = copy.splice(0, mcCount);
        multipleChoice = generateMultipleChoiceCards(mcCards, flashcards);
      }

      if (activeTypes.includes("written")) {
        const isLast = activeTypes.indexOf("written") === typeCount - 1;
        const writeCount = isLast ? copy.length : cardsPerType;
        written = copy.splice(0, writeCount);
      }

      if (activeTypes.includes("trueFalse")) {
        const tfCards = copy; // Lấy toàn bộ phần còn lại
        trueOrFalse = tfCards.map((card) => {
          const falseAnswer =
            flashcards
              .filter((el) => el.id !== card.id)
              .at(Math.floor(Math.random() * (flashcards.length - 1)))
              ?.definition ?? card.definition;

          const answer = Math.random() < 0.5 ? falseAnswer : card.definition;

          return { ...card, answer };
        });
      }

      return {
        trueOrFalse,
        written,
        multipleChoice,
      };
    }),
} satisfies TRPCRouterRecord;
