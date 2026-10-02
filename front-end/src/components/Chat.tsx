import React, { useState } from "react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "other";
  type?: string;
}

const Chat = (): React.ReactElement => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "What kind of nonsense is this", sender: "other", type: "primary" },
    { id: 2, text: "Put me on the Council and not make me a Master!??", sender: "other", type: "secondary" },
    { id: 3, text: "That's never been done in the history of the Jedi.", sender: "other", type: "accent" },
    { id: 4, text: "It's insulting!", sender: "other", type: "neutral" },
    
  ]);

  const [inputVal, setInputVal] = useState("");

  const handleSend = () => {
    if (!inputVal.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        text: inputVal,
        sender: "user",
        type: "warning",
      },
    ]);

    setInputVal(""); // Réinitialise le champ après envoi
  };

  return (
    <div className="card bg-base-200 p-4 shadow-md overflow-y-auto max-h-130">
      <div className="flex-1 overflow-y-auto text-sm text-gray-500 mb-2 ">
        <div className="aura aura-glow ">
          <div className="card bg-base-100">
            <div className="card-body">
              {/* Avatars */}
          <div className="avatar avatar-online avatar-placeholder">
            <div className="bg-neutral text-neutral-content w-12 rounded-full">
              <span>SY</span>
            </div>
          </div>
     

              {/* Rendu dynamique des messages */}
              {messages.map((msg) => (
                <div key={msg.id} className={`chat ${msg.sender === "user" ? "chat-end" : "chat-start"}`}>
                  <div className={`chat-bubble chat-bubble-${msg.type || "primary"}`}>{msg.text}</div>
                </div>
              ))}

              {/* Champ de saisie et bouton d'envoi */}
              <fieldset className="fieldset mt-4 sticky bottom-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type here"
                    className="input"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  />
                  <button className="btn btn-soft btn-secondary" onClick={handleSend}>
                    Envoyer
                  </button>
                </div>
              </fieldset>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
