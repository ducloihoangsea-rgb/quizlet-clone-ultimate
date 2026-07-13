import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

import { Flashcard } from "./flashcard";
import { User } from "./user";

export const StudyProgress = pgTable(
  "study_progress",
  {
    userId: uuid()
      .references(() => User.id, { onDelete: "cascade" })
      .notNull(),
    flashcardId: integer()
      .references(() => Flashcard.id, { onDelete: "cascade" })
      .notNull(),

    // Flashcards Mode State (unseen, learning, known)
    flashcardStatus: varchar("flashcard_status", { length: 20 }).default("unseen").notNull(),

    // Learn Mode (SRS) State
    srsStep: integer("srs_step").default(0).notNull(), // 0: new, 1: learning, 2: reviewing, 3: graduated
    repetition: integer("repetition").default(0).notNull(), // Count of successful reviews in a row
    interval: real("interval").default(0).notNull(), // Current interval in days
    easeFactor: real("ease_factor").default(2.5).notNull(), // SM-2 Ease Factor
    nextReviewDate: timestamp("next_review_date").defaultNow().notNull(), // Next due date
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.flashcardId] }),
  })
);

export const StudyProgressRelations = relations(
  StudyProgress,
  ({ one }) => ({
    user: one(User, {
      fields: [StudyProgress.userId],
      references: [User.id],
    }),
    flashcard: one(Flashcard, {
      fields: [StudyProgress.flashcardId],
      references: [Flashcard.id],
    }),
  })
);

export type SelectStudyProgress = typeof StudyProgress.$inferSelect;
export type InsertStudyProgress = typeof StudyProgress.$inferInsert;
export type UpdateStudyProgress = Partial<InsertStudyProgress> & { userId: string; flashcardId: number };