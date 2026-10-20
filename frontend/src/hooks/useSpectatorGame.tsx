// // delete

// import { useEffect, useState } from "react";
// import { io, Socket } from 'socket.io-client';
// import type { LiveGamePayload } from "../types/gameTypes";

// export const useSpectatorGame = (gameId: string) => {
//   const [gameState, setGameState] = useState<LiveGamePayload | null>(null);

//   useEffect(() => {
//     // initialize the socket
//     const socket: Socket = io('/spectator');

//     // define the join logic
//     const joinRoom = () => {
//       socket.emit('joinSpectatorRoom', { gameId });
//     };

//     // prevent race conditions
//     if (socket.connected) {
//       joinRoom();
//     } else {
//       socket.on('connect', joinRoom);
//     }

//     // listen for the payload from the backend
//     socket.on('spectatorGameState', (game: LiveGamePayload) => {
//       setGameState(game);
//     })

//     // socket.on('connect', () => {
//     //   socket.emit('joinSpectatorRoom', { gameId });
//     // });

//     // socket.on('spectatorGameState', (game: LiveGamePayload) => {
//     //   setGameState(game);
//     // });

//     return () => {
//       socket.emit('leaveSpectatorRoom', { gameId });
//       socket.off('connect', joinRoom);
//       socket.off('spectatorGameState');
//       socket.disconnect();
//     };
//   }, [gameId]);

//   return { gameState };
// }