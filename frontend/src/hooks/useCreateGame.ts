import { useState } from "react";
import type { GameMode } from "../types/gameTypes";
import { loadSavedLocalGame } from "./useLocalGame";

export function useCreateGame() {
    const [mode, setMode] = useState<GameMode>(() =>
        loadSavedLocalGame() ? "LOCAL" : "BOT"
    );

    function selectMode(next: GameMode) {
        setMode(next);
    }

    return { mode, selectMode };
}
