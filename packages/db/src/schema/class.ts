import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { User } from "./user";
import { ClassesToStudySets } from "./classToStudySet";
import { ClassesToFolders } from "./classToFolder";

export const Class = pgTable("class", {
  id: uuid().notNull().primaryKey().defaultRandom(),
  name: text().notNull(),
  schoolName: text().notNull(),
  cityName: text().notNull(),
  countryName: text().notNull(),
  slug: text().notNull(),
  userId: uuid()
    .references(() => User.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ mode: "date" }).notNull().defaultNow(),
});

export const ClassRelations = relations(Class, ({ one, many }) => ({
  user: one(User, {
    fields: [Class.userId],
    references: [User.id],
  }),
  classesToStudySets: many(ClassesToStudySets),
  classesToFolders: many(ClassesToFolders),
}));

export type InsertClass = typeof Class.$inferInsert;
export type UpdateClass = Partial<InsertClass> & { id: string };
export type SelectClass = typeof Class.$inferSelect;
