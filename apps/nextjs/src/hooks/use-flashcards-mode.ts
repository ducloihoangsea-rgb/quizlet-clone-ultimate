"use client";

import { useEffect } from "react";
import { useAnimate } from "framer-motion";

import { api } from "~/trpc/react";
import { useFlashcardsModeReducer } from "./use-flashcards-mode-reducer";

export function useFlashcardsMode(id: string, level?: number) {
  const [{ flashcards: initialFlashcards }] =
    api.studySet.byId.useSuspenseQuery({ id });
  const { data: studyProgress } = api.studyProgress.getProgress.useQuery({ studySetId: id });
  const { mutate: updateStatus } = api.studyProgress.updateFlashcardStatus.useMutation();
  const { mutate: resetProgressMutation } = api.studyProgress.resetFlashcardProgress.useMutation();

  const [{ sorting, flashcards, index, starredOnly, hard, know, trackProgress, learningCount, knownCount, history, frontFace, textToSpeech }, dispatch] =
    useFlashcardsModeReducer(initialFlashcards, studyProgress ?? [], level);

  const [cardRef, animateCard] = useAnimate();
  const [messageRef, animateMessage] = useAnimate();

  const starredCards = initialFlashcards.filter((card) => card.starred);

  useEffect(() => {
    if (starredOnly) {
      const oldIds = flashcards.map((card) => card.id);
      const editedCards = initialFlashcards.filter((card) =>
        oldIds.includes(card.id),
      );
      dispatch({
        type: "SET_FLASHCARDS",
        payload: editedCards,
      });
    } else {
      dispatch({
        type: "SET_FLASHCARDS",
        payload: initialFlashcards,
      });
    }

    if (starredOnly && starredCards.length === 0) {
      dispatch({ type: "TOGGLE_STARRED_ONLY" });
    }
  }, [initialFlashcards]);

  const currentCard = flashcards[index];

  const disableStarredOnly = starredCards.length === 0;

  const count = flashcards.length;

  const progress = (index / flashcards.length) * 100;

  const reviewHard = () => {
    dispatch({ type: "REVIEW_HARD" });
  };

  const reset = () => {
    resetProgressMutation({ studySetId: id });
    dispatch({ type: "RESET", payload: initialFlashcards });
  };

  const handleLeft = async () => {
    if (!currentCard) {
      return;
    }

    if (trackProgress) {
      // Trong chế độ theo dõi tiến độ, nút X = đánh dấu "Đang học"
      dispatch({ type: "MARK_LEARNING" });
      updateStatus({ flashcardId: currentCard.id, status: "learning" });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, 2, 2, 0],
          translateX: [0, 0, 0, -50],
        },
        {
          ease: "linear",
          duration: 0.5,
        },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );
    } else if (sorting) {
      dispatch({ type: "MARK_HARD", payload: currentCard });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, 2, 2, 0],
          translateX: [0, 0, 0, -50],
        },
        {
          ease: "linear",
          duration: 0.5,
        },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );

      dispatch({ type: "NEXT" });
    } else {
      dispatch({ type: "PREVIOUS" });
      animateCard(
        cardRef.current,
        { rotateY: [15, 0], translateX: [-60, 0] },
        { duration: 0.15 },
      );
    }
  };

  const handleRight = async () => {
    if (!currentCard) {
      return;
    }

    if (trackProgress) {
      // Trong chế độ theo dõi tiến độ, nút ✓ = đánh dấu "Đã biết"
      dispatch({ type: "MARK_KNOWN_PROGRESS" });
      updateStatus({ flashcardId: currentCard.id, status: "known" });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, -2, -2, 0],
          translateX: [0, 0, 0, 50],
        },
        { ease: "linear", duration: 0.5 },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );
    } else if (sorting) {
      dispatch({ type: "MARK_KNOWN" });

      await animateMessage(
        messageRef.current,
        {
          opacity: [0, 1, 1, 0],
          visibility: "visible",
          rotate: [0, -2, -2, 0],
          translateX: [0, 0, 0, 50],
        },
        { ease: "linear", duration: 0.5 },
      );
      await animateMessage(
        messageRef.current,
        { visibility: "hidden" },
        { duration: 0 },
      );

      dispatch({ type: "NEXT" });
    } else {
      animateCard(
        cardRef.current,
        { translateX: [60, 0], rotateY: [-15, 0] },
        { duration: 0.15 },
      );
      dispatch({ type: "NEXT" });
    }
  };

  const shuffle = () => {
    dispatch({ type: "SHUFFLE" });
  };

  const toggleSorting = () => {
    dispatch({ type: "TOGGLE_SORTING" });
  };

  const setFrontFace = (payload: "term" | "definition" | "both") => {
    dispatch({ type: "SET_FRONT_FACE", payload });
  };

  const toggleTextToSpeech = () => {
    dispatch({ type: "TOGGLE_TEXT_TO_SPEECH" });
  };

  const toggleStarredOnly = () => {
    dispatch({ type: "TOGGLE_STARRED_ONLY" });
  };

  const toggleTrackProgress = () => {
    dispatch({ type: "TOGGLE_TRACK_PROGRESS" });
  };

  const undo = () => {
    if (history.length > 0 && index > 0) {
      const previousCard = flashcards[index - 1];
      if (previousCard && trackProgress) {
        updateStatus({ flashcardId: previousCard.id, status: "unseen" });
      }
    }
    dispatch({ type: "UNDO" });
  };

  return {
    index,
    currentCard,
    sorting,
    starredOnly,
    disableStarredOnly,
    count,
    hardCount: hard.length,
    cardRef,
    messageRef,
    know,
    progress,
    trackProgress,
    learningCount,
    knownCount,
    canUndo: history.length > 0,
    frontFace,
    setFrontFace,
    textToSpeech,
    toggleTextToSpeech,
    handleLeft,
    handleRight,
    reset,
    reviewHard,
    shuffle,
    toggleSorting,
    toggleStarredOnly,
    toggleTrackProgress,
    undo,
  };
}
