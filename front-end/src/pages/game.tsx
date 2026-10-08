import React, { useState, useRef, useEffect } from "react";
import Board from "../components/Board";
import type { PlayerColor, Position } from "../types/gameTypes";

import { useCreateGame } from "../hooks/useCreateGame";
import Lobby from "../components/Lobby";
import useGameSocket from "../hooks/useGameSocket";
import { useLocalGame } from "../hooks/useLocalGame";
import useMoveHistory from '../hooks/useMoveHistory';
import { useAuthContext } from '../hooks/useAuthContext';
import { toClientCell } from "../utils/cellConverter";
import GameHeader from "../components/GameHeader";
import History from "../components/History";
import LocalGame from "../components/LocalGame";
import GameEndModal from "../components/GameEndModal";
import { ChatPanel } from "../components/Chat"

interface ChatMessage {
  id: string | number;
  author?: string;
  own: boolean;
  time: string;
  text: string;
}

const Game = (): React.ReactElement => {  
  const { mode, selectMode } = useCreateGame();
  const {
    isConnected,
    error,
    findMatch,
    startBotGame,
    waiting,
    gameState,
    playMove,
    sendMessage,
    forfeit,
    chatMessages: rawChatMessages,
    isMovePending,
    isBotThinking,
  } = useGameSocket(mode !== "LOCAL");
  
  const { user } = useAuthContext();
  const { history, showLatestFirst, toggleOrder } = useMoveHistory(gameState);

  const isBotMode = gameState?.mode === "BOT" || mode === "BOT";

  const leftColor: PlayerColor = gameState?.players.find((player) => player.userId === user?.id)?.color
    ?? gameState?.players[0]?.color
    ?? 'BLACK';
  const local = useLocalGame();

  const [rightPanel, setRightPanel] = useState<"chat" | "history">("chat");
  const [chatInput, setChatInput] = useState("");

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isBotMode) {
      setRightPanel("history");
    }
  }, [isBotMode]);

  const formattedChatMessages: ChatMessage[] = rawChatMessages.map((msg) => {
    const isMe = msg.senderId === user?.id;
    return {
      id: msg.id,
      text: msg.text,
      own: isMe,
      author: msg.author || (isMe ? "Vous" : "Adversaire"),
      time: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  });

  function handlePlay(nextMove: Position) {
    if (isMovePending) return;
    playMove(nextMove);
  }

  function handleStart() {
    if (mode === "LOCAL") local.start();
    else if (mode === "BOT") startBotGame();
    else findMatch();
  }

  function handleChatSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(chatInput);
    setChatInput("");
  }

  // Extrait les scores depuis le résultat officiel NestJS ou compte les cellules
  const isGameFinished = gameState?.status === "FINISHED";
  const blackScore =
    gameState?.result?.blackCount ??
    gameState?.cells.filter((c) => c.color === "BLACK" || (c as unknown as number) === 1).length ??
    0;
  const whiteScore =
    gameState?.result?.whiteCount ??
    gameState?.cells.filter((c) => c.color === "WHITE" || (c as unknown as number) === 2).length ??
    0;

  if (mode === "LOCAL" && local.started) {
    return (
      <LocalGame
        board={local.board}
        currentPlayer={local.currentPlayer}
        validMoves={local.validMoves}
        blackScore={local.blackScore}
        whiteScore={local.whiteScore}
        isFinished={local.isFinished}
        winner={local.winner}
        notice={local.notice}
        moveHistory={local.moveHistory}
        onMove={local.playMove}
        onRestart={local.start}
        onQuit={local.quit}
      />
    );
  }

  return !gameState || mode === "LOCAL" ? (
    <Lobby
      mode={mode}
      selectMode={selectMode}
      onStart={handleStart}
      isConnected={isConnected}
      connectionError={error}
      waiting={waiting}
    />
  ) : (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
      <div className="flex flex-col lg:col-span-2 lg:max-h-[800px]">
        <div className="w-full mb-2 flex justify-between items-center">
          <GameHeader gameState={gameState} mode={gameState.mode} />
        </div>

        <div className="grid flex-1">
          <Board
            board={gameState.cells.map(toClientCell)}
            validMoves={gameState.validMoves}
            onMove={handlePlay}
            disabled={isMovePending || isBotThinking || gameState.status === "FINISHED"}
          />
          
          {gameState.status === "IN_PROGRESS" && (
            <div className="flex justify-center mt-4">
              <button
                onClick={forfeit}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                Abandonner la partie
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex justify-center mt-4 text-error text-lg font-semibold"
            >
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center max-h-[800px] lg:justify-start ">
        <div className="w-full max-w-sm h-full flex flex-col rounded-xl overflow-y-auto min-h-[400px] border border-[#3d3a36] bg-base-100">
          <div className="flex shrink-0 gap-1 border-b border-[#3d3a36] p-2">
            {!isBotMode && (
              <button
                onClick={() => setRightPanel("chat")}
                className={`btn btn-lg btn-ghost flex-1 cursor-pointer rounded-lg border-none py-2 text-xs font-medium transition-all ${
                  rightPanel === "chat"
                    ? "bg-base-200"
                    : "bg-transparent text-[#6b6865]"
                }`}
              >
                Chat
              </button>
            )}

            <button
              onClick={() => setRightPanel("history")}
              className={`btn btn-lg btn-ghost flex-1 cursor-pointer rounded-lg border-none py-2 text-xs font-medium transition-all ${
                rightPanel === "history" || isBotMode
                  ? "bg-base-200"
                  : "bg-transparent text-[#6b6865]"
              }`}
            >
              Move History · {history.length}
            </button>
          </div>

          {rightPanel === "chat" && !isBotMode ? (
            <ChatPanel
              messages={formattedChatMessages}
              value={chatInput}
              onChange={setChatInput}
              onSubmit={handleChatSubmit}
              endRef={chatEndRef}
            />
          ) : (
            <History
              history={history}
              leftColor={leftColor}
              showLatestFirst={showLatestFirst}
              onReverse={toggleOrder}
            />
          )}
        </div>
      </div>

      {/* Modale de fin de partie pour BOT & ONLINE */}
      <GameEndModal
        isOpen={isGameFinished}
        winner={gameState.result?.winner ?? null}
        userColor={leftColor}
        blackScore={blackScore}
        whiteScore={whiteScore}
        onRestartOrRematch={handleStart}
        onQuit={() => selectMode("LOCAL")}
      />
    </div>
  );
};

export default Game;