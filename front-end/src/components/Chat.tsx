import React, { useState, useEffect } from "react";
import { Socket } from "socket.io-client";

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
