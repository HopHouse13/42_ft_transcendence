import { useEffect, useState } from "react";
import { io, Socket } from 'socket.io-client';
import type { LiveGamePayload } from '../types/gameTypes';

// create a single shared socket outside the hook
const spectatorSocket: Socket = io('/spectator', {
  autoConnect: false, // dont connect until a component actually asks for it
});

// track how many components are currently using this socket
let activeSubscribers = 0;
let disconnectTimer: ReturnType<typeof setTimeout>;

export const useSpectatorSocket = () => {
  const [liveGames, setLiveGames] = useState<LiveGamePayload[]>([]);
  const [isLoaded, setIsLoaded] = useState(false); // loading state

  useEffect(() => {
    // clear any pending disconnects
    clearTimeout(disconnectTimer);

    activeSubscribers++;

    if (!spectatorSocket.connected) {
      spectatorSocket.connect();
    }

    const handleLiveGames = (games: LiveGamePayload[]) => {
      setLiveGames(games);
      setIsLoaded(true);
    };

    const handleConnect = () => {
      spectatorSocket.emit('requestLiveGames');
    }

    // attach listeners
    spectatorSocket.on('liveGamesList', handleLiveGames);
    spectatorSocket.on('connect', handleConnect);

    // if already connected (eg navigating to watchGame), ask for data immediatly
    if (spectatorSocket.connected) {
      handleConnect();
    }

    return () => {
      activeSubscribers--;
      spectatorSocket.off('liveGamesList', handleLiveGames);
      spectatorSocket.off('connect', handleConnect);

      // only disconnect if no components are lokking at the spectator feed anymore
      if (activeSubscribers === 0) {
        // wait 100 ms before disconnecting
        disconnectTimer = setTimeout(() => {
          if (activeSubscribers === 0) spectatorSocket.disconnect();
        }, 100);
      }
    };
  }, []);

  return { liveGames, isLoaded };
};