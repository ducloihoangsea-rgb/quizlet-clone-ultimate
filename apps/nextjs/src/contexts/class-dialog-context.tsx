"use client";

import type { Dispatch, PropsWithChildren } from "react";
import { createContext, useContext, useReducer } from "react";

interface ClassDialogState {
  open: boolean;
}

type ClassModalAction = { type: "open" } | { type: "close" };

const classModalReducer = (
  state: ClassDialogState,
  action: ClassModalAction,
): ClassDialogState => {
  if (action.type === "open") {
    return {
      ...state,
      open: true,
    };
  }

  return {
    ...state,
    open: false,
  };
};

const initialState: ClassDialogState = {
  open: false,
};

type ClassDialogContext = [ClassDialogState, Dispatch<ClassModalAction>];

const ClassDialogContext = createContext<ClassDialogContext>([
  initialState,
  () => null,
]);

const ClassDialogProvider = ({ children }: PropsWithChildren) => {
  const [state, dispatch] = useReducer(classModalReducer, initialState);

  return (
    <ClassDialogContext.Provider value={[state, dispatch]}>
      {children}
    </ClassDialogContext.Provider>
  );
};

export default ClassDialogProvider;

export const useClassDialogContext = (): ClassDialogContext =>
  useContext(ClassDialogContext);
