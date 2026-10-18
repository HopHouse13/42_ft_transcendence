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

  // Référence vers le conteneur de messages
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // 📜 Défilement automatique vers le bas dès que la liste `messages` change
  // sans forcer le focus sur le chat
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleSubmit = (e: React.SubmitEvent) => {
    
    e.preventDefault();
    if (!input.trim() || !isConnected) return;

    // Envoi via WebSocket
    sendMessage(input);
    setInput("");
  };

return (
    <div className="flex flex-col h-[480px] w-full max-w-sm bg-stone-300 border border-gray-400 rounded-2xl shadow-sm text-sm">
      {/* En-tête avec voyant d'état */}
      <div className="px-4 py-3 border-b border-gray-400 flex items-center justify-between ">
        <span className="font-medium text-gray-500 text-xs tracking-wider uppercase">
          Discussion ({roomId})
        </span>
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${ (isConnected) ? "bg-emerald-400 animate-pulse" : "bg-gray-300" }`} />
      </div>

      {/* Zone de messages */}
      <div ref={messagesContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-200">
        { (messages.length === 0) ? ( <div className="h-full flex items-center justify-center text-xs text-gray-400"> Aucun message pour le moment.</div> ) : ( messages.map((msg) => { const isMe = msg.userId === currentUserId;

            return (

              <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`} >
                <div className="text-[10px] text-gray-400 mb-0.5 px-1">
                  {isMe ? "Vous" : (msg.userName ? msg.userName : "Inconnu")}
                </div>
                <div className={`px-3 py-2 rounded-2xl max-w-[85%] text-xs leading-relaxed ${(isMe) ? "bg-blue-600/80 text-stone-100 rounded-br-xs" : "bg-stone-500 text-stone-100 rounded-bl-xs"}`} >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Formulaire de saisie */}
      <form onSubmit={handleSubmit} className="p-2.5 border-t border-gray-400 flex items-center gap-2" >
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder={isConnected ? "Écrire un message..." : "Connexion en cours..."} disabled={!isConnected} className="input input-sm flex-1 bg-gray-100/80 border-none focus:outline-none focus:bg-gray-100 text-gray-800 placeholder-gray-400 text-xs rounded-xl" />
        <button type="submit" disabled={!isConnected || !input.trim()} className="btn btn-sm btn-ghost btn-circle text-blue-500 hover:bg-blue-50 disabled:bg-transparent disabled:text-gray-400"> ➔ </button>
      </form>
    </div>
  );
}