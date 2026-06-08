"use client";

import Link from "next/link";

import { Button } from "@acme/ui/button";

import { useMatchModeContext } from "~/contexts/match-mode-context";
import EndScreen from "./end-screen";
import MatchCardsGrid from "./match-cards-grid";
import MatchGameTimer from "./match-game-timer";
import StartScreen from "./start-screen";

const MatchGame = ({ id }: { id: string }) => {
  const { screen } = useMatchModeContext();

  return (
    <>
      {screen === "initial" && <StartScreen />}
      {screen === "play" && (
        <>
          <MatchGameTimer />
          <MatchCardsGrid />
        </>
      )}
      {screen === "result" && <EndScreen />}
    </>
  );
};

export default MatchGame;
