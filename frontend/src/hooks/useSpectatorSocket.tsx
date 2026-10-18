import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import { LiveGamePayLoad } from '../types/gameTypes';

export const useSpectatorSocket = () => {
  const [liveGames, setLiveGames] = useState<LiveGamePayLoad[]>([]);

  useEffect(() => {
    // connect excluysively to the spectator namespace
    const socket: Socket = io('/spectator');

    // listen for the backend emitting the array
    socket.on('liveGameList', (games: LiveGamePayLoad[]) => {
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