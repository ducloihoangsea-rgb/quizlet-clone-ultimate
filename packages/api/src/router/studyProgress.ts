import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq, and, inArray } from "@acme/db";
import { Flashcard, StudyProgress } from "@acme/db/schema";
import { protectedProcedure, publicProcedure } from "../trpc";

export const studyProgressRouter = {
  getStudySetsProgress: protectedProcedure
    .input(z.object({ studySetIds: z.array(z.string()) }))
    .query(async ({ ctx, input }) => {
      if (input.studySetIds.length === 0) return {};

      const flashcards = await ctx.db
        .select({ id: Flashcard.id, studySetId: Flashcard.studySetId })
        .from(Flashcard)
        .where(inArray(Flashcard.studySetId, input.studySetIds));

      if (flashcards.length === 0) return {};

      const flashcardIds = flashcards.map((f) => f.id);

      const progressList = await ctx.db.query.StudyProgress.findMany({
        where: (p, { eq, and, inArray }) =>
          and(
            eq(p.userId, ctx.session.user.id),
            inArray(p.flashcardId, flashcardIds)
          ),
      });

      const learnedSet = new Set(
        progressList
          .filter((p) => p.srsStep >= 1 || p.flashcardStatus === "known")
          .map((p) => p.flashcardId)
      );

      const result: Record<
        string,
        { learned: number; total: number; percentage: number }
      > = {};

      for (const setId of input.studySetIds) {
        const setCards = flashcards.filter((f) => f.studySetId === setId);
        const total = setCards.length;
        const learned = setCards.filter((f) => learnedSet.has(f.id)).length;
        const percentage = total > 0 ? Math.round((learned / total) * 100) : 0;
        result[setId] = { learned, total, percentage };
      }

      return result;
    }),

  getProgress: publicProcedure
    .input(z.object({ studySetId: z.string() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.session?.user?.id;
      if (!userId) return [];

      // Get all flashcards for this study set
      const flashcards = await ctx.db
        .select({ id: Flashcard.id })
        .from(Flashcard)
        .where(eq(Flashcard.studySetId, input.studySetId));
        
      if (flashcards.length === 0) return [];

      const flashcardIds = flashcards.map((f) => f.id);

      // Get progress for these flashcards for the current user
      // Assuming drizzle allows inArray. We can just use a simple query
      // since we can't be sure about inArray import right now, we can do this:
      const progress = await ctx.db.query.StudyProgress.findMany({
        where: (progress, { eq, and, inArray }) =>
          and(
            eq(progress.userId, userId),
            inArray(progress.flashcardId, flashcardIds)
          ),
      });

      return progress;
    }),

  updateFlashcardStatus: protectedProcedure
    .input(
      z.object({
        flashcardId: z.number(),
        status: z.enum(["unseen", "learning", "known"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .insert(StudyProgress)
        .values({
          userId: ctx.session.user.id,
          flashcardId: input.flashcardId,
          flashcardStatus: input.status,
        })
        .onConflictDoUpdate({
          target: [StudyProgress.userId, StudyProgress.flashcardId],
          set: { flashcardStatus: input.status },
        });

      return { success: true };
    }),

  resetFlashcardProgress: protectedProcedure
    .input(z.object({ studySetId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const flashcards = await ctx.db
        .select({ id: Flashcard.id })
        .from(Flashcard)
        .where(eq(Flashcard.studySetId, input.studySetId));

      if (flashcards.length === 0) return { success: true };
      const flashcardIds = flashcards.map((f) => f.id);

      // We use raw sql/inArray in db if needed, or simply delete many
      // But we can just use the query builder's 'inArray' manually imported if we need to.
      // We will do a generic update instead of delete so SRS state is kept, but flashcard state resets.
      // Wait, if they reset Flashcard progress, they want to reset flashcardStatus to 'unseen'.
      // They don't want to lose SRS state!
      
      // I'll update instead of delete.
      for (const id of flashcardIds) {
        await ctx.db
          .update(StudyProgress)
          .set({ 
            flashcardStatus: "unseen",
            srsStep: 0,
            repetition: 0,
            interval: 0,
            easeFactor: 2.5,
            nextReviewDate: new Date()
          })
          .where(
            and(
              eq(StudyProgress.userId, ctx.session.user.id),
              eq(StudyProgress.flashcardId, id)
            )
          );
      }

      return { success: true };
    }),
  submitLearnReview: protectedProcedure
    .input(z.object({ flashcardId: z.number(), grade: z.number().min(0).max(5) }))
    .mutation(async ({ ctx, input }) => {
      const progressList = await ctx.db.query.StudyProgress.findMany({
        where: (p, { eq, and }) =>
          and(eq(p.userId, ctx.session.user.id), eq(p.flashcardId, input.flashcardId)),
        limit: 1,
      });
      let progress = progressList[0];
      if (!progress) {
        progress = {
          userId: ctx.session.user.id,
          flashcardId: input.flashcardId,
          flashcardStatus: "unseen",
          srsStep: 0,
          repetition: 0,
          interval: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date(),
        };
      }

      let { srsStep, easeFactor, repetition } = progress;
      const { grade } = input;

      if (grade >= 3) {
        // Correct response -> Level Up
        srsStep = Math.min(7, srsStep + 1);
      } else {
        // Incorrect response -> Level Down
        srsStep = Math.max(0, srsStep - 1);
      }

      // 0: chưa thuộc, 1: 1h, 2: 1d, 3: 3d, 4: 7d, 5: 21d, 6: 56d, 7: 150d
      const intervalsInDays = [0, 1 / 24, 1, 3, 7, 21, 56, 150];
      const interval = intervalsInDays[srsStep] ?? 0;

      const nextReviewDate = new Date();
      nextReviewDate.setTime(nextReviewDate.getTime() + interval * 24 * 60 * 60 * 1000);

      await ctx.db
        .insert(StudyProgress)
        .values({
          userId: ctx.session.user.id,
          flashcardId: input.flashcardId,
          srsStep,
          repetition,
          interval,
          easeFactor,
          nextReviewDate,
        })
        .onConflictDoUpdate({
          target: [StudyProgress.userId, StudyProgress.flashcardId],
          set: { srsStep, repetition, interval, easeFactor, nextReviewDate },
        });

      return { success: true, nextReviewDate };
    }),
};
