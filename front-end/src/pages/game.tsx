import React, { useState, useRef } from "react";
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

// const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

interface ChatMessage {
  id: string | number;
  author?: string;
  own: boolean;
  time: string;
  text: string;
}

function ChatPanel({
  messages,
  value,
  onChange,
  onSubmit,
  endRef,
}: {
  messages: ChatMessage[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div
        className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 min-h-0"
        aria-live="polite"
      >
        <div className="text-center text-xs" style={{ color: "#6b6865" }}>
          Les messages sont visibles par les joueurs de la partie.
        </div>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-1 ${
              message.own ? "items-end" : "items-start"
            }`}
          >
            <div className="flex items-center gap-1.5 px-1">
              <span
                className="text-xs font-medium"
                style={{ color: message.own ? "#81b64c" : "#9e9b97" }}
              >
                {message.own ? "Vous" : message.author}
              </span>
              <span
                className="text-xs"
                style={{
                  color: "#6b6865",
                  fontFamily: "'DM Mono', monospace",
                }}
              >
                {message.time}
              </span>
            </div>
            <div
              className="max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed chat-message"
              style={{
                background: message.own ? "#4a7c59" : "#302e2b",
                color: "#e8e6e3",
                borderBottomRightRadius: message.own ? "4px" : undefined,
                borderBottomLeftRadius: message.own ? undefined : "4px",
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="p-3 flex gap-2 shrink-0"
        style={{ borderTop: "1px solid #3d3a36" }}
      >
        <label htmlFor="match-chat" className="sr-only">
          Votre message
        </label>
        <input
          id="match-chat"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={180}
          placeholder="Écrire un message…"
          autoComplete="off"
          className="min-w-0 flex-1 rounded-lg px-3 py-2 text-xs outline-none"
          style={{
            background: "#1f1e1c",
            color: "#e8e6e3",
            border: "1px solid #3d3a36",
          }}
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Envoyer le message"
          className="rounded-lg px-3 text-xs font-semibold transition-all disabled:opacity-40"
          style={{
            background: "#81b64c",
            color: "#fff",
            border: "none",
            cursor: value.trim() ? "pointer" : "default",
          }}
        >
          Envoyer
        </button>
      </form>
    </>
  );
}

const Game = (): React.ReactElement => {  const { mode, selectMode } = useCreateGame();
  const {
    isConnected,
    error,
    findMatch,
    startBotGame,
    waiting,
    gameState,
    playMove,
    isMovePending,
    isBotThinking,
  } = useGameSocket(mode !== "LOCAL");
	const { user } = useAuthContext();

	const { history, showLatestFirst, toggleOrder } = useMoveHistory(gameState);

	// Couleur du joueur local, affichée à gauche comme dans le GameHeader
	const leftColor: PlayerColor = gameState?.players.find((player) => player.userId === user?.id)?.color
		?? gameState?.players[0]?.color
		?? 'BLACK';
  const local = useLocalGame();

  const [rightPanel, setRightPanel] = useState<"chat" | "history">("chat");
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

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

    const newMessage: ChatMessage = {
      id: Date.now(),
      own: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      text: chatInput,
    };

    setChatMessages((prev) => [...prev, newMessage]);
    setChatInput("");
  }

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 items-stretch">
      <div className="lg:col-span-2 flex flex-col">
        <div className="w-full mb-2">
          <GameHeader gameState={gameState} mode={gameState.mode} />
        </div>
        <div className="grid flex-1">
          <Board
            board={gameState.cells.map(toClientCell)}
            validMoves={gameState.validMoves}
            onMove={handlePlay}
            disabled={isMovePending || isBotThinking}
          />
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

      <div className="flex justify-center lg:justify-start h-full">
        <div
          className="w-full max-w-sm h-full flex flex-col rounded-xl overflow-hidden min-h-[400px]"
          style={{ background: "#262421", border: "1px solid #3d3a36" }}
        >
          <div
            className="flex p-1.5 gap-1 shrink-0"
            style={{ borderBottom: "1px solid #3d3a36" }}
          >
            {(["chat", "history"] as const).map((panel) => (
              <button
                key={panel}
                onClick={() => setRightPanel(panel)}
                className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: rightPanel === panel ? "#3d3a36" : "transparent",
                  color: rightPanel === panel ? "#e8e6e3" : "#6b6865",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {panel === "chat" ? "Discussion" : `Coups · ${history.length}`}
              </button>
            ))}
          </div>

          {rightPanel === "chat" ? (
            <ChatPanel
              messages={chatMessages}
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
    </div>
  );
};

export default Game;
