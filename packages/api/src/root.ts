import { activityRouter } from "./router/activity";
import { authRouter } from "./router/auth";
import { flashcardRouter } from "./router/flashcard";
import { folderRouter } from "./router/folder";
import { starredFlashcardRouter } from "./router/starredFlashcard";
import { studySetRouter } from "./router/studySet";
import { userRouter } from "./router/user";
import { classRouter } from "./router/class";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  studySet: studySetRouter,
  user: userRouter,
  folder: folderRouter,
  flashcard: flashcardRouter,
  starredFlashcard: starredFlashcardRouter,
  activity: activityRouter,
  class: classRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
