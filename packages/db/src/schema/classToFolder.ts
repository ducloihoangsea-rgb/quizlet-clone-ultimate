import { relations } from "drizzle-orm";
import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";

import { Class } from "./class";
import { Folder } from "./folder";

export const ClassesToFolders = pgTable(
  "class_to_folder",
  {
    classId: uuid()
      .notNull()
      .references(() => Class.id, { onDelete: "cascade" }),
    folderId: uuid()
      .notNull()
      .references(() => Folder.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.classId, t.folderId] }),
  }),
);

export const ClassToFolderRelations = relations(
  ClassesToFolders,
  ({ one }) => ({
    class: one(Class, {
      fields: [ClassesToFolders.classId],
      references: [Class.id],
    }),
    folder: one(Folder, {
      fields: [ClassesToFolders.folderId],
      references: [Folder.id],
    }),
  }),
);

export type InsertClassToFolder = typeof ClassesToFolders.$inferInsert;
