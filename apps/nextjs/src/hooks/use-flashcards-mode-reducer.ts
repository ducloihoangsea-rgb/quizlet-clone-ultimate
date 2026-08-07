"use client";

import { useReducer } from "react";

import type { RouterOutputs } from "@acme/api";

type Flashcards = RouterOutputs["studySet"]["byId"]["flashcards"];
type Progress = RouterOutputs["studyProgress"]["getProgress"];

export const flashcardsInitial = {
  flashcards: [] as Flashcards,
  index: 0,
  hard: [] as Flashcards,
  sorting: false,
  starredOnly: false,
  know: false,
  trackProgress: false,
  learningCount: 0,
  knownCount: 0,
  // Stack lưu lịch sử để undo: mỗi phần tử là { action: "learning" | "known" }
  history: [] as Array<{ action: "learning" | "known" }>,
  frontFace: "term" as "term" | "definition" | "both",
  textToSpeech: false,
};

type FlashcardsGameState = typeof flashcardsInitial;
type FlashcardsGameAction =
  | { type: "NEXT" }
  | { type: "PREVIOUS" }
  | { type: "SHUFFLE" }
  | { type: "RESET"; payload: Flashcards }
  | { type: "MARK_HARD"; payload: Flashcards[number] }
  | { type: "MARK_KNOWN" }
  | { type: "REVIEW_HARD" }
  | { type: "TOGGLE_SORTING" }
  | { type: "TOGGLE_STARRED_ONLY" }
  | { type: "SET_FLASHCARDS"; payload: Flashcards }
  | { type: "TOGGLE_TRACK_PROGRESS" }
  | { type: "MARK_LEARNING" }
  | { type: "MARK_KNOWN_PROGRESS" }
  | { type: "UNDO" }
  | { type: "SET_FRONT_FACE"; payload: "term" | "definition" | "both" }
  | { type: "TOGGLE_TEXT_TO_SPEECH" };

export const flashcardsReducer = (
  state: FlashcardsGameState,
  action: FlashcardsGameAction,
): FlashcardsGameState => {
  if (action.type === "NEXT") {
    return { ...state, index: state.index + 1 };
  }
  if (action.type === "PREVIOUS") {
    return { ...state, index: state.index - 1 };
  }
  if (action.type === "TOGGLE_SORTING") {
    return { ...state, sorting: !state.sorting };
  }
  if (action.type === "MARK_KNOWN") {
    return { ...state, know: true };
  }
  if (action.type === "REVIEW_HARD") {
    return {
      ...state,
      flashcards: state.hard,
      hard: [],
      index: 0,
      learningCount: 0,
      knownCount: 0,
      history: [],
    };
  }
  if (action.type === "SHUFFLE") {
    return {
      ...state,
      flashcards: state.flashcards.sort(() => 0.5 - Math.random()),
    };
  }
  if (action.type === "MARK_HARD") {
    return {
      ...state,
      hard: [...state.hard, action.payload],
      know: false,
    };
  }
  if (action.type === "RESET") {
    const starredCards = action.payload.filter((card) => card.starred);
    return {
      ...flashcardsInitial,
      starredOnly: state.starredOnly,
      sorting: state.sorting,
      trackProgress: state.trackProgress,
      flashcards: state.starredOnly ? starredCards : action.payload,
    };
  }

  if (action.type === "SET_FLASHCARDS") {
    return { ...state, flashcards: action.payload };
  }

  // Track Progress actions
  if (action.type === "TOGGLE_TRACK_PROGRESS") {
    if (state.trackProgress) {
      // Tắt track progress → reset counters và quay lại chế độ thường
      return {
        ...state,
        trackProgress: false,
        sorting: false,
        learningCount: 0,
        knownCount: 0,
        history: [],
      };
    }
    // Bật track progress → bật sorting mode và reset counters
    return {
      ...state,
      trackProgress: true,
      sorting: true,
      learningCount: 0,
      knownCount: 0,
      history: [],
    };
  }

  if (action.type === "MARK_LEARNING") {
    const currentCard = state.flashcards[state.index];
    return {
      ...state,
      learningCount: state.learningCount + 1,
      hard: currentCard ? [...state.hard, currentCard] : state.hard,
      index: state.index + 1,
      know: false,
      history: [...state.history, { action: "learning" }],
    };
  }

  if (action.type === "MARK_KNOWN_PROGRESS") {
    return {
      ...state,
      knownCount: state.knownCount + 1,
      index: state.index + 1,
      know: true,
      history: [...state.history, { action: "known" }],
    };
  }

  if (action.type === "UNDO") {
    if (state.history.length === 0 || state.index === 0) return state;
    const lastAction = state.history[state.history.length - 1]!;
    return {
      ...state,
      index: state.index - 1,
      learningCount: lastAction.action === "learning" ? state.learningCount - 1 : state.learningCount,
      knownCount: lastAction.action === "known" ? state.knownCount - 1 : state.knownCount,
      hard: lastAction.action === "learning" ? state.hard.slice(0, -1) : state.hard,
      history: state.history.slice(0, -1),
    };
  }

  if (action.type === "SET_FRONT_FACE") {
    return { ...state, frontFace: action.payload };
  }

  if (action.type === "TOGGLE_TEXT_TO_SPEECH") {
    return { ...state, textToSpeech: !state.textToSpeech };
  }

  const starredCards = state.flashcards.filter((card) => card.starred);

  return {
    ...state,
    starredOnly: !state.starredOnly,
    index: 0,
    flashcards: state.starredOnly ? flashcardsInitial.flashcards : starredCards,
  };
};

export const useFlashcardsModeReducer = (flashcards: Flashcards, progress: Progress, level?: number) => {
  const progressMap = new Map(progress.map((p) => [p.flashcardId, p.flashcardStatus]));
  const progressFullMap = new Map(progress.map((p) => [p.flashcardId, p]));

  let filteredFlashcards = flashcards;
  if (level !== undefined) {
    const now = new Date();
    filteredFlashcards = flashcards.filter(card => {
      const p = progressFullMap.get(card.id);
      const cardLevel = p ? Math.min(p.srsStep || 0, 7) : 0;
      if (cardLevel !== level) return false;
      
      if (!p) return true;
      if (p.nextReviewDate && new Date(p.nextReviewDate) <= now) return true;
      return false;
    });
  }

  const learningCards = (level !== undefined ? filteredFlashcards : flashcards).filter((c) => progressMap.get(c.id) === "learning");
  const unseenCards = (level !== undefined ? filteredFlashcards : flashcards).filter(
    (c) => !progressMap.has(c.id) || progressMap.get(c.id) === "unseen"
  );
  
  // Nếu có thẻ đang học hoặc chưa xem thì kết hợp lại, nếu không thì lấy toàn bộ (trường hợp đã học hết)
  const remainingCards = level !== undefined 
    ? filteredFlashcards
    : (learningCards.length > 0 || unseenCards.length > 0
      ? [...learningCards, ...unseenCards]
      : flashcards);

  const learningCount = learningCards.length;
  const knownCount = progress.filter((p) => p.flashcardStatus === "known").length;

  const hasProgress = learningCount > 0 || knownCount > 0;

  return useReducer(flashcardsReducer, {
    ...flashcardsInitial,
    flashcards: remainingCards,
    hard: learningCards,
    learningCount,
    knownCount,
    trackProgress: hasProgress,
    sorting: hasProgress,
  });
};
