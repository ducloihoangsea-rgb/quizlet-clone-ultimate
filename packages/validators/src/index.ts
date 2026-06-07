import { z } from "zod";

export const CreateUserSchema = z.object({
  birthday: z.string(),
  email: z.string().email(),
  name: z.string(),
  password: z.string(),
});

const FlashcardSchema = z.object({
  term: z.string().min(1, "Specify term of your flashcard"),
  definition: z.string().min(1, "Specify definition of your flashcard"),
  position: z.number(),
  id: z.number().optional(),
  studySetId: z.string().optional(),
});

export const StudySetSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters long"),
  description: z.string().optional(),
  flashcards: z
    .array(FlashcardSchema)
    .min(4, "You have to create at least 4 flashcards"),
});

export type StudySetValues = z.infer<typeof StudySetSchema>;

export const CreateFolderSchema = z.object({
  name: z.string().min(1, "Folder name is required"),
  description: z.string().optional(),
});

export type CreateFolderValues = z.infer<typeof CreateFolderSchema>;

export const EditFolderSchema = CreateFolderSchema.merge(
  z.object({
    id: z.string().min(1, "Folder id is required"),
  }),
);

export type EditFolderValues = z.infer<typeof EditFolderSchema>;

export const AddSetSchema = z.object({
  folderId: z.string(),
  studySetId: z.string(),
});

export const EditFlashcardSchema = z.object({
  id: z.number(),
  term: z.string().min(1, "Term is required"),
  definition: z.string().min(1, "Definition is required"),
});

export const CreateClassSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập tên lớp học"),
  schoolName: z.string().min(1, "Vui lòng nhập tên trường học"),
  cityName: z.string().min(1, "Vui lòng nhập tên thành phố"),
  countryName: z.string().min(1, "Vui lòng nhập tên quốc gia"),
});

export type CreateClassValues = z.infer<typeof CreateClassSchema>;

export const EditClassSchema = CreateClassSchema.merge(
  z.object({
    id: z.string().min(1, "Class id is required"),
  }),
);

export type EditClassValues = z.infer<typeof EditClassSchema>;

export const AddSetToClassSchema = z.object({
  classId: z.string(),
  studySetId: z.string(),
});

export const AddFolderToClassSchema = z.object({
  classId: z.string(),
  folderId: z.string(),
});
