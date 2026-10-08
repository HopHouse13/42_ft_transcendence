import React from "react";
import type { GameMode } from "../types/gameTypes";

interface LobbyProps {
  mode: GameMode;
  selectMode: (gameMode: GameMode) => void;
  onStart: () => void;
  isConnected: boolean;
  connectionError: string | null;
  waiting: string | null;
}

export function Lobby({
  mode,
  selectMode,
  onStart,
  isConnected,
  connectionError,
  waiting,
}: LobbyProps): React.ReactElement {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onStart();
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[440px] p-4">
      <form
        onSubmit={handleSubmit}
        className="card w-full max-w-md bg-base-200/80 backdrop-blur-md border border-base-300 shadow-2xl p-6 rounded-3xl transition-all duration-300 hover:border-neutral/30"
      >
        <div className="card-body p-0 flex flex-col items-center gap-6">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-1">
            
            <h2 className="card-title text-3xl font-black text-base-content tracking-tight">
              Othello
            </h2>
            <p className="text-xs text-base-content/60 font-medium">
              Select a game mode to get started
            </p>
          </div>

          {/* Segmented Controller (Tabs Neutral) */}
          <div className="w-full bg-base-300/60 p-1.5 rounded-2xl border border-base-100 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => selectMode("LOCAL")}
              className={`py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === "LOCAL"
                  ? "bg-neutral text-neutral-content shadow-lg shadow-neutral/20 scale-[1.02]"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              Pass & Play
            </button>

            <button
              type="button"
              onClick={() => selectMode("BOT")}
              className={`py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === "BOT"
                  ? "bg-neutral text-neutral-content shadow-lg shadow-neutral/20 scale-[1.02]"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              VS AI
            </button>

            <button
              type="button"
              onClick={() => selectMode("ONLINE")}
              className={`py-3 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                mode === "ONLINE"
                  ? "bg-neutral text-neutral-content shadow-lg shadow-neutral/20 scale-[1.02]"
                  : "text-base-content/60 hover:text-base-content hover:bg-base-200/50"
              }`}
            >
              Online
            </button>
          </div>

          {/* Status Indicator Bar */}
          <div className="w-full min-h-[44px] flex items-center justify-center">
            {mode === "ONLINE" || mode === "BOT" ? (
              <div className="badge badge-neutral gap-2.5 py-3.5 px-4 rounded-full border border-base-300 text-xs font-semibold shadow-inner">
                {isConnected ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success" />
                  </span>
                ) : !connectionError ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-warning animate-pulse" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-error" />
                )}

                <span className="text-base-content/80">
                  {isConnected
                    ? "Server connected"
                    : !connectionError
                    ? "Connecting to server…"
                    : `Connection error: ${connectionError}`}
                </span>
              </div>
            ) : (
              <span className="text-xs text-base-content/50 font-medium">
                🎮 Play locally with a friend on one device
              </span>
            )}
          </div>

          {/* Action Button Neutral & Matchmaking Card */}
          {waiting && mode === "ONLINE" ? (
            <div className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-base-300/80 border border-base-100 w-full text-center shadow-inner animate-pulse">
              <span className="loading loading-spinner loading-md text-neutral-content" />
              <div>
                <p className="text-xs font-extrabold text-base-content">
                  Searching for an opponent…
                </p>
                <p className="text-[11px] text-base-content/50 font-mono mt-1">
                  Room ID: {waiting}
                </p>
              </div>
            </div>
          ) : (
            <button
              type="submit"
              disabled={mode !== "LOCAL" && !isConnected}
              className="btn btn-neutral btn-block rounded-2xl text-sm font-extrabold shadow-lg shadow-neutral/20 transition-all duration-200 active:scale-95 disabled:opacity-40 cursor-pointer"
            >
              {mode === "BOT"
                ? "Play Against AI"
                : mode === "LOCAL"
                ? "Start Local Match"
                : "Find Opponent"}
            </button>
          )}

        </div>
      </form>
    </div>
  );
}

export default Lobby;