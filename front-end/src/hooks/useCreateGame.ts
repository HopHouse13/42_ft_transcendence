import { useState } from "react";
import type { GameMode } from "../types/gameTypes";

// : {mode: GameMode, selectMode: (mode: GameMode) => void}

export function useCreateGame() {
    const [mode, setMode] = useState<GameMode>("BOT");

    function selectMode (next: GameMode) {
        setMode(next);
    };

    return (
        { mode, selectMode }
    );
}