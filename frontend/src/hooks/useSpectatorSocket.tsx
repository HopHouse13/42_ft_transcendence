import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import type { LiveGamePayload } from '../types/gameTypes';

export const useSpectatorSocket = () => {
  const [liveGames, setLiveGames] = useState<LiveGamePayload[]>([]);

  useEffect(() => {
    // connect excluysively to the spectator namespace
    const socket: Socket = io('/spectator');

    // listen for the backend emitting the array
    socket.on('liveGamesList', (games: LiveGamePayload[]) => {
      setLiveGames(games);
    });

    // once connected, ask the backend for current list
    socket.on('connect', () => {
      socket.emit('requestLiveGames');
    });

    // clean up connection
    return () => {
      socket.disconnect();
    };
  }, []);
  return { liveGames };
};