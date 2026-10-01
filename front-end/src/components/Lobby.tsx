import React from "react";
import type { GameMode } from "../types/gameTypes";
// import { useCreateGame } from "../hooks/useCreateGame";

interface GameProps {
    mode: GameMode;
    selectMode: (gameMode: GameMode) => void;
    onStart: () => void;
    isConnected: boolean;
    connectionError: string | null;
    waiting: string | null;
}

 const Lobby = ({ mode, selectMode, onStart, isConnected, connectionError, waiting }: GameProps): React.ReactElement => {

    function onSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        onStart();
    }

    return (
        <form
         className="fieldset w-auto bg-base-200 border-base-200 rounded-box border p-4"
         onSubmit={onSubmit}
         >
            <div className="flex flex-col items-center justify-center gap-4">
                {/* <h1 className="text-4xl font-bold text-center mb-4">Choose Your game Mode</h1> */}
                <div role="tablist" className="tabs tabs-box tabs-lg border-base-300 font-semibold">
                    <input
                        type="radio"
                        name="game_tab"
                        className="tab checked:tab-active"
                        aria-label="Local"
                        checked={mode === "LOCAL"}
                        onChange={() => selectMode("LOCAL")}
                    />
                    <input
                        type="radio"
                        name="game_tab"
                        className="tab checked:tab-active"
                        aria-label="AI"
                        checked={mode === "BOT"}
                        onChange={() => selectMode("BOT")}
                    />
                    <input
                        type="radio"
                        name="game_tab"
                        className="tab checked:tab-active"
                        aria-label="Online"
                        checked={mode === "ONLINE"}
                        onChange={() => selectMode("ONLINE")}
                    />
                </div>
                {mode === "ONLINE" && (
                    <div>
                        {isConnected ? (
                            <div className="inline-grid *:[grid-area:1/1]">
                                <div className="status status-success animate-ping"></div>
                                <div className="status status-success"></div>
                            </div>
                        ) : !connectionError ? (
                        <div className="status status-warning animate-bounce"></div>
                        ) : (
                            <div className="inline-grid *:[grid-area:1/1]">
                                <div className="status status-error animate-ping"></div>
                                <div className="status status-error"></div>
                            </div>
                        )}
                        <span className="ml-2">
                            {isConnected 
                                ? "Connected"
                                : !connectionError 
                                ? "Connecting..."
                                : `Connection failed: ${connectionError}`
                            }
                        </span>
                    </div>
                )}
                {waiting 
                    ? <span>Room ID : {waiting}</span>
                    : <button type="submit" className="btn btn-lg btn-soft btn-success">Play</button>
                }
            </div>
        </form>
    );
}

export default Lobby;