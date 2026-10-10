import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

interface SocketMessage {
  id: string | number;
  text: string;
  senderId: string;
  author?: string;
  time?: string;
}

export interface ChatPanelProps {
  socket: Socket;
  gameId: string;
}

interface ChatMessage {
  id: string | number;
  author?: string;
  own: boolean;
  time: string;
  text: string;
}

export function ChatPanel({
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
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, endRef]);

  return (
    <>
      <div
        className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3 min-h-0"
        aria-live="polite"
      >
        <div className="text-center text-xs text-[#6b6865]">
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
                className={`text-xs font-medium ${
                  message.own ? "text-[#81b64c]" : "text-[#9e9b97]"
                }`}
              >
                {message.own ? "Vous" : message.author}
              </span>
              <span className="text-xs text-[#6b6865] font-['DM_Mono']">
                {message.time}
              </span>
            </div>
            <div
              className={`max-w-[85%] rounded-xl px-3 py-2 text-xs leading-relaxed chat-message text-[#e8e6e3] ${
                message.own
                  ? "bg-[#4a7c59] rounded-br-[4px]"
                  : "bg-[#302e2b] rounded-bl-[4px]"
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={onSubmit}
        className="flex shrink-0 gap-2 border-t border-[#3d3a36] p-3"
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
          className="min-w-0 flex-1 rounded-lg border border-[#3d3a36] bg-[#1f1e1c] px-3 py-2 text-xs text-[#e8e6e3] outline-none"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Envoyer le message"
          className="cursor-pointer rounded-lg border-none bg-[#81b64c] px-3 text-xs font-semibold text-white transition-all disabled:cursor-default disabled:opacity-40"
        >
          Envoyer
        </button>
      </form>
    </>
  );
}
export default ChatPanel