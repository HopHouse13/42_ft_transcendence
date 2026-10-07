import React, { useState, useEffect, useRef } from "react";
import { Socket } from "socket.io-client";

export interface ChatMessage {
  id: string | number;
  author?: string;
  own: boolean;
  time: string;
  text: string;
}

// Format du message reçu depuis le WebSocket
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

export function ChatPanel({ socket, gameId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [value, setValue] = useState<string>("");
  const endRef = useRef<HTMLDivElement | null>(null);

  // Fonction utilitaire pour adapter un message reçu par le socket au format ChatMessage de l'UI
  const formatSocketMessage = (msg: SocketMessage): ChatMessage => {
    const isMe = msg.senderId === socket.id;
    return {
      id: msg.id,
      text: msg.text,
      own: isMe,
      author: msg.author || (isMe ? "Vous" : `Joueur ${msg.senderId.slice(0, 4)}`),
      time: msg.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
  };

  // Gestion des événements WebSocket
  useEffect(() => {
    if (!socket) return;

    // 1. Rejoindre la room de la partie courante
    socket.emit("joinGame", gameId);

    // 2. Recevoir l'historique des messages
    const handleAllMessages = (history: SocketMessage[]) => {
      setMessages(history.map(formatSocketMessage));
    };

    // 3. Écouter les nouveaux messages
    const handleNewMessage = (message: SocketMessage) => {
      setMessages((prev) => [...prev, formatSocketMessage(message)]);
    };

    socket.on("allMessages", handleAllMessages);
    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("allMessages", handleAllMessages);
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, gameId]);

  // Défilement automatique vers le bas à chaque nouveau message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  // Envoi du message via WebSocket
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim() || !socket) return;

    // Envoyer le message avec le gameId
    socket.emit("sendMessage", { gameId, text: value });
    setValue("");
  };

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
        onSubmit={handleSubmit}
        className="flex shrink-0 gap-2 border-t border-[#3d3a36] p-3"
      >
        <label htmlFor="match-chat" className="sr-only">
          Votre message
        </label>
        <input
          id="match-chat"
          value={value}
          onChange={(e) => setValue(e.target.value)}
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

/*import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";


export interface ChatMessage {
  id: string | number;
  author?: string;
  own: boolean;
  time: string;
  text: string;
}

export function ChatPanel ({ 
  messages,
  value,
  onChange,
  onSubmit,
  endRef 
}: {
  messages: ChatMessage[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  endRef: React.RefObject<HTMLDivElement | null>;
}) {

  useEffect(() => {
    endRef.current?.scrollIntoView({behavior: "smooth", block: "nearest" });
  }, [messages, endRef])

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

/*
interface Message {
  id: number;
  text: string;
  senderId: string;
}

interface ChatProps {
  socket: Socket;
  gameId: string;
}

const Chat: React.FC<ChatProps> = ({ socket, gameId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    if (!socket) return;

    // 1. Rejoindre la room de la partie courante
    socket.emit("joinGame", gameId);

    // 2. Recevoir l'historique de la partie
    socket.on("allMessages", (history: Message[]) => {
      setMessages(history);
    });

    // 3. Écouter les nouveaux messages de la partie
    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("allMessages");
      socket.off("newMessage");
    };
  }, [socket, gameId]);

  const handleSend = () => {
    if (!inputVal.trim() || !socket) return;

    // Envoyer le message avec le gameId
    socket.emit("sendMessage", { gameId, text: inputVal });
    setInputVal("");
  };

  return (
    <div className="card bg-base-200 p-4 shadow-md">
      <div className="flex flex-col gap-2 max-h-80 overflow-y-auto mb-4">
        {messages.map((msg) => {
          const isMe = msg.senderId === socket.id;
          return (
            <div key={msg.id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
              <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : "chat-bubble-secondary"}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="input input-bordered w-full"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Chat de la partie..."
        />
        <button className="btn btn-secondary" onClick={handleSend}>
          Envoyer
        </button>
      </div>
    </div>
  );
};

export default Chat;
*/