import React, { useState, useEffect, useRef } from "react";
import  useChatRoomSocket  from "../hooks/useChatRoomSocket"

/* --------------------------------------------------------------------------------------------- */
/*                                          ~~ ChatRoom ~~                                       */
/* --------------------------------------------------------------------------------------------- */
interface ChatRoomProps {
  roomId?: string;
}
  /* -------------------------------------------------------------------------- */

export function ChatRoom({ roomId = "room-demo" }: ChatRoomProps ) {
  
  const [input, setInput] = useState("");
  
  // Utilisation de notre hook mis à jour
  const { isConnected, messages, sendMessage, currentUserId } = useChatRoomSocket(roomId);

  // Élément de référence situé tout en bas de la liste de messages
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // 📜 Défilement automatique vers le bas dès que la liste `messages` change
  useEffect(() => {
  
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  
  }, [messages]);
  
  const handleSubmit = (e: React.FormEvent) => {
    
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    // Envoi via WebSocket
    sendMessage(input);
    setInput("");
  };

return (
    <div className="flex flex-col h-[450px] w-full max-w-sm bg-white border border-gray-100 rounded-2xl shadow-sm text-sm">
      {/* En-tête avec voyant d'état */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <span className="font-medium text-gray-500 text-xs tracking-wider uppercase">
          Discussion ({roomId})
        </span>
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${ (isConnected) ? "bg-emerald-400 animate-pulse" : "bg-gray-300" }`} />
      </div>

      {/* Zone de messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white">
        { (messages.length === 0) ? ( <div className="h-full flex items-center justify-center text-xs text-gray-400"> Aucun message pour le moment.</div> ) : ( messages.map((msg) => { const isMe = msg.userId === currentUserId;

            return (

              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`} >
                <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                  {isMe ? "Vous" : `Utilisateur (${msg.userId.slice(0, 4)})`}
                </div>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed ${ (isMe )? "bg-blue-500 text-white rounded-br-xs" : "bg-gray-100 text-gray-700 rounded-bl-xs"}`} >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        {/* Ancre invisible ciblée par le défilement automatique */}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire de saisie */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-gray-100 flex items-center gap-2 bg-gray-50/30" >
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isConnected ? "Écrire un message..." : "Connexion en cours..."} disabled={!isConnected} className="input input-sm flex-1 bg-gray-100/80 border-none focus:outline-none focus:bg-gray-100 text-gray-800 placeholder-gray-400 text-xs rounded-xl" />
        <button type="submit" disabled={!isConnected || !input.trim()} className="btn btn-sm btn-ghost btn-circle text-blue-500 hover:bg-blue-50 disabled:bg-transparent disabled:text-gray-300"> ➔ </button>
      </form>
    </div>
  );
}