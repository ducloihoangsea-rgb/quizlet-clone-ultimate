import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { Class } from "./class";
import { StudySet } from "./studySet";

export const ClassesToStudySets = pgTable(
  "class_to_study_set",
  {
    classId: uuid()
      .notNull()
      .references(() => Class.id, { onDelete: "cascade" }),
    studySetId: uuid()
      .notNull()
      .references(() => StudySet.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.classId, t.studySetId] }),
  }),
);

export const ClassToStudySetRelations = relations(
  ClassesToStudySets,
  ({ one }) => ({
    class: one(Class, {
      fields: [ClassesToStudySets.classId],
      references: [Class.id],
    }),
    studySet: one(StudySet, {
      fields: [ClassesToStudySets.studySetId],
      references: [StudySet.id],
    }),
  }),
);

export type InsertClassToStudySet = typeof ClassesToStudySets.$inferInsert;
