import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthSession } from "./useAuthSession";


export interface ChatMessage {
  
  id: 		   number;
  text: 	   string;
  userId:	   string;
  roomId:	   string;
  
  userName?: string;
}

export function useChatRoomSocket( roomId?: string ) {

  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const { user, loading } = useAuthSession();

  useEffect(() => {
    // Si l'auth charge encore ou si l'utilisateur n'est pas connecté, on ne fait rien
    if ( loading || !user?.id ) return;

    // 1. Instanciation
    const socket = io(window.location.origin, { autoConnect: false, query: { userId: user.id, userName: user.username }, withCredentials: true });

	socketRef.current = socket;
    // 2. Écouteur de l'événement de connexion
    socket.on("connect", () => {

      console.log("Connecté au WS ! ID Socket :", socket.id);
      setIsConnected(true);

      // Rejoindre la salon (room) du jeu si gameId est fourni
        socket.emit("joinRoom", { roomId });
    });

    socket.on("disconnect", () => {

    	console.log("Déconnecté du WS ChatRoom")
    	setIsConnected(false);
    });
    // 3. Réception de l'historique ('allMessages') émis par handleJoinRoom
    socket.on("allMessages", (history: ChatMessage[]) => {
      setMessages(history);
    });

    // 4. Réception des nouveaux messages ('newMessage') émis par handleMessage
    socket.on("newMessage", (message: ChatMessage) => {
      setMessages((prev) => [...prev, message]);
    });

    // Connexion explicite
    socket.connect();

    // 5. Nettoyage
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("allMessages");
      socket.off("newMessage");
      socket.disconnect();
    };
  
  }, [loading, user?.id, roomId ]);
// Fonction pour envoyer un message en suivant la signature NestJS: { roomId, text }
  const sendMessage = useCallback((text: string) => {
    if (socketRef.current && socketRef.current.connected && text.trim()) {
      socketRef.current.emit("sendMessage", {
        roomId: roomId || "global",
        text: text.trim(),
      });
    }
  }, [roomId]);

  return { isConnected, messages, sendMessage, currentUserId: user?.id };
}

export default useChatRoomSocket;