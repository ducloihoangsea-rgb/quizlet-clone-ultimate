import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { Folder, StudySet, Flashcard, FoldersToStudySets } from "@acme/db/schema";

import {
  createFolder,
  createFolderToStudySet,
  deleteFolder,
  deleteFolderToStudySet,
  editFolder,
} from "@acme/db/mutations";
import { getFolderQuery, getUserFoldersQuery } from "@acme/db/queries";
import {
  AddSetSchema,
  CreateFolderSchema,
  EditFolderSchema,
} from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const folderRouter = {
  allByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getUserFoldersQuery(ctx.db, input.userId);
    }),
  create: protectedProcedure
    .input(CreateFolderSchema)
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.name);

      const folder = await createFolder(ctx.db, {
        ...input,
        slug,
        userId: ctx.session.user.id,
      });

      if (!folder) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create folder",
        });
      }

      return folder;
    }),
  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const folder = await getFolderQuery(ctx.db, input.slug);

      if (!folder) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Folder not found",
        });
      }

      return folder;
    }),
  addSet: protectedProcedure
    .input(AddSetSchema)
    .mutation(async ({ input, ctx }) => {
      return await createFolderToStudySet(ctx.db, input);
    }),
  removeSet: protectedProcedure
    .input(AddSetSchema)
    .mutation(async ({ input, ctx }) => {
      return await deleteFolderToStudySet(ctx.db, input);
    }),
  edit: protectedProcedure
    .input(EditFolderSchema)
    .mutation(async ({ input, ctx }) => {
      const folder = await editFolder(ctx.db, input);

      if (!folder) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Server error",
        });
      }

      return folder;
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await deleteFolder(ctx.db, input.id);
    }),
  saveSharedFolder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const originalFolder = await ctx.db.query.Folder.findFirst({
        where: eq(Folder.id, input.id),
      });

      if (!originalFolder) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
      }

      const newSlug = slugify(originalFolder.name) + "-" + Math.random().toString(36).substring(2, 6);

      const newFolder = await createFolder(ctx.db, {
        name: originalFolder.name,
        description: originalFolder.description,
        slug: newSlug,
        userId: ctx.session.user.id,
      });

      if (!newFolder) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create folder" });
      }

      const folderStudySets = await ctx.db.query.FoldersToStudySets.findMany({
        where: eq(FoldersToStudySets.folderId, input.id),
      });

      if (folderStudySets.length > 0) {
        await ctx.db.insert(FoldersToStudySets).values(
          folderStudySets.map((fts) => ({
            folderId: newFolder.id,
            studySetId: fts.studySetId,
          }))
        );
      }

      return newFolder;
    }),
  cloneSharedFolder: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return await ctx.db.transaction(async (tx) => {
        const originalFolder = await tx.query.Folder.findFirst({
          where: eq(Folder.id, input.id),
        });

        if (!originalFolder) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });
        }

        const newSlug = slugify(originalFolder.name) + "-" + Math.random().toString(36).substring(2, 6);
        const newFolder = await tx
          .insert(Folder)
          .values({
            name: originalFolder.name,
            description: originalFolder.description,
            slug: newSlug,
            userId: ctx.session.user.id,
          })
          .returning()
          .then((res) => res[0]);
          
        if (!newFolder) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Could not create folder" });
        }

        const folderStudySets = await tx.query.FoldersToStudySets.findMany({
          where: eq(FoldersToStudySets.folderId, input.id),
        });

        for (const fts of folderStudySets) {
          const originalStudySet = await tx.query.StudySet.findFirst({
            where: eq(StudySet.id, fts.studySetId),
            with: { flashcards: true },
          });

          if (originalStudySet) {
            const newStudySet = await tx
              .insert(StudySet)
              .values({
                title: originalStudySet.title,
                description: originalStudySet.description,
                userId: ctx.session.user.id,
              })
              .returning()
              .then((res) => res[0]);
              
            if (!newStudySet) continue;

            if (originalStudySet.flashcards.length > 0) {
              await tx.insert(Flashcard).values(
                originalStudySet.flashcards.map((f) => ({
                  term: f.term,
                  definition: f.definition,
                  position: f.position,
                  studySetId: newStudySet.id,
                }))
              );
            }

            await tx.insert(FoldersToStudySets).values({
              folderId: newFolder.id,
              studySetId: newStudySet.id,
            });
          }
        }

        return newFolder;
      });
    }),
} satisfies TRPCRouterRecord;
