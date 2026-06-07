import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import slugify from "slugify";
import { z } from "zod";
import { eq, and } from "@acme/db";
import { 
  Class, 
  ClassesToStudySets, 
  ClassesToFolders, 
  StudySet, 
  Folder,
  User
} from "@acme/db/schema";
import { 
  CreateClassSchema, 
  EditClassSchema,
  AddSetToClassSchema,
  AddFolderToClassSchema
} from "@acme/validators";

import { protectedProcedure, publicProcedure } from "../trpc";

export const classRouter = {
  allByUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      return await ctx.db
        .select()
        .from(Class)
        .where(eq(Class.userId, input.userId))
        .orderBy(Class.createdAt);
    }),

  create: protectedProcedure
    .input(CreateClassSchema)
    .mutation(async ({ input, ctx }) => {
      const slug = slugify(input.name, { lower: true });
      
      const [newClass] = await ctx.db
        .insert(Class)
        .values({
          name: input.name,
          schoolName: input.schoolName,
          cityName: input.cityName,
          countryName: input.countryName,
          slug,
          userId: ctx.session.user.id,
        })
        .returning();

      if (!newClass) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not create class",
        });
      }

      return newClass;
    }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const classData = await ctx.db.query.Class.findFirst({
        where: eq(Class.id, input.id),
        with: {
          user: true,
        },
      });

      if (!classData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Fetch related study sets
      const studySetsRelations = await ctx.db
        .select({
          id: StudySet.id,
          title: StudySet.title,
        })
        .from(ClassesToStudySets)
        .innerJoin(StudySet, eq(StudySet.id, ClassesToStudySets.studySetId))
        .where(eq(ClassesToStudySets.classId, input.id));

      // Fetch related folders
      const foldersRelations = await ctx.db
        .select({
          id: Folder.id,
          name: Folder.name,
          slug: Folder.slug,
        })
        .from(ClassesToFolders)
        .innerJoin(Folder, eq(Folder.id, ClassesToFolders.folderId))
        .where(eq(ClassesToFolders.classId, input.id));

      return {
        ...classData,
        studySets: studySetsRelations,
        folders: foldersRelations,
      };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input, ctx }) => {
      const classData = await ctx.db.query.Class.findFirst({
        where: eq(Class.slug, input.slug),
        with: {
          user: true,
        },
      });

      if (!classData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Class not found",
        });
      }

      // Fetch related study sets
      const studySetsRelations = await ctx.db
        .select({
          id: StudySet.id,
          title: StudySet.title,
        })
        .from(ClassesToStudySets)
        .innerJoin(StudySet, eq(StudySet.id, ClassesToStudySets.studySetId))
        .where(eq(ClassesToStudySets.classId, classData.id));

      // Fetch related folders
      const foldersRelations = await ctx.db
        .select({
          id: Folder.id,
          name: Folder.name,
          slug: Folder.slug,
        })
        .from(ClassesToFolders)
        .innerJoin(Folder, eq(Folder.id, ClassesToFolders.folderId))
        .where(eq(ClassesToFolders.classId, classData.id));

      return {
        ...classData,
        studySets: studySetsRelations,
        folders: foldersRelations,
      };
    }),

  edit: protectedProcedure
    .input(EditClassSchema)
    .mutation(async ({ input, ctx }) => {
      const [updatedClass] = await ctx.db
        .update(Class)
        .set({
          name: input.name,
          schoolName: input.schoolName,
          cityName: input.cityName,
          countryName: input.countryName,
          slug: slugify(input.name, { lower: true }),
        })
        .where(eq(Class.id, input.id))
        .returning();

      if (!updatedClass) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not save class changes",
        });
      }

      return updatedClass;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const [deletedClass] = await ctx.db
        .delete(Class)
        .where(eq(Class.id, input.id))
        .returning();

      if (!deletedClass) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not delete class",
        });
      }

      return deletedClass;
    }),

  addSet: protectedProcedure
    .input(AddSetToClassSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .insert(ClassesToStudySets)
        .values({
          classId: input.classId,
          studySetId: input.studySetId,
        })
        .onConflictDoNothing();
    }),

  removeSet: protectedProcedure
    .input(AddSetToClassSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .delete(ClassesToStudySets)
        .where(
          and(
            eq(ClassesToStudySets.classId, input.classId),
            eq(ClassesToStudySets.studySetId, input.studySetId)
          )
        );
    }),

  addFolder: protectedProcedure
    .input(AddFolderToClassSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .insert(ClassesToFolders)
        .values({
          classId: input.classId,
          folderId: input.folderId,
        })
        .onConflictDoNothing();
    }),

  removeFolder: protectedProcedure
    .input(AddFolderToClassSchema)
    .mutation(async ({ input, ctx }) => {
      return await ctx.db
        .delete(ClassesToFolders)
        .where(
          and(
            eq(ClassesToFolders.classId, input.classId),
            eq(ClassesToFolders.folderId, input.folderId)
          )
        );
    }),
} satisfies TRPCRouterRecord;
