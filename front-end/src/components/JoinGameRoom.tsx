import { useState, useEffect, useRef, ChangeEvent } from 'react';
import OthelloGame from './OthelloGame';
import type { GameState } from '../types/game';

const API_URL = 'http://localhost:3000';

type JoinResponse =
  | { status: 'waiting'; roomId: string }
  | { status: 'ready'; game: GameState; roomId?: string };

interface PlayerRoom {
  userId: string;
  socketId: string;
  color?: string;
  invit?: string;
}

function JoinGameRoom() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JoinResponse | null>(null);
  const [userId, setUserId] = useState('');
  const [socketId, setSocketId] = useState(crypto.randomUUID());
  const [color, setColor] = useState('');
  const [invit, setInvit] = useState('');
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ Tant que result.status === 'waiting', on repoll toutes les 2s
  // pour voir si un adversaire nous a rejoint entre-temps.
  useEffect(() => {
    if (result?.status !== 'waiting') {
      return;
    }

    const roomId = result.roomId;

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/game-room/status/${roomId}`);
        if (!response.ok) return; // on retentera au prochain tick

        const data: JoinResponse = await response.json();

        if (data.status === 'ready') {
          setResult(data);
        }
      } catch {
        // Erreur réseau ponctuelle : on retentera au prochain tick, pas la peine de bloquer l'UI
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [result]);

  const regenerateSocketId = () => {
    setSocketId(crypto.randomUUID());
  };

  const handleUserIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setColor(e.target.value);
  };

  const handleInvitChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInvit(e.target.value);
  };

  // ✅ Fonction générique pour envoyer une requête POST
  const sendPostRequest = async (endpoint: string, player: PlayerRoom) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/game-room/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player }),
      });

      const rawText = await response.text();

      // ✅ Gestion des erreurs HTTP
      if (!response.ok) {
        const errorData = (() => {
          try {
            return JSON.parse(rawText);
          } catch {
            return { message: rawText || 'Erreur inconnue' };
          }
        })();
        throw new Error(errorData.message || `Erreur ${response.status}`);
      }

      // Le backend renvoie soit du JSON (partie trouvée -> GameState),
      // soit une string brute (en attente -> juste le roomId, sans JSON).
      let data: JoinResponse;
      try {
        const parsed = JSON.parse(rawText);
        // Si c'est un objet JSON, on considère que la partie est prête
        data = { status: 'ready', game: parsed };
      } catch {
        // Pas du JSON valide -> c'est le roomId brut en attente d'un adversaire
        data = { status: 'waiting', roomId: rawText };
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinByColor = async () => {
    if (!userId.trim()) {
      setError('Veuillez entrer un userId.');
      return;
    }

    const player: PlayerRoom = {
      userId,
      socketId,
      color: color || undefined,
    };

    await sendPostRequest('entry', player);
  };

  const handleJoinByInvit = async () => {
    if (!userId.trim() || !invit.trim()) {
      setError('Veuillez entrer un userId et une invitation valide.');
      return;
    }

    const player: PlayerRoom = {
      userId,
      socketId,
      invit,
    };

    await sendPostRequest('invit', player);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <h2>Rejoindre une partie</h2>

      {/* UserId */}
      <div>
        <label htmlFor="userId" style={{ display: 'block', marginBottom: '0.25rem' }}>
          UserId :
        </label>
        <input
          id="userId"
          type="text"
          value={userId}
          onChange={handleUserIdChange}
          placeholder="Ex: e6716105-ea41-4e4c-be44-42705f207b5e"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      {/* SocketId */}
      <div>
        <label htmlFor="socketId" style={{ display: 'block', marginBottom: '0.25rem' }}>
          SocketId :
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="socketId"
            type="text"
            value={socketId}
            readOnly
            style={{ flex: 1, padding: '0.5rem', backgroundColor: '#f0f0f0', color: '#1a1a1a' }}
          />
          <button onClick={regenerateSocketId} style={{ padding: '0.5rem' }}>
            Régénérer
          </button>
        </div>
      </div>

      {/* Couleur */}
      <div>
        <label htmlFor="color" style={{ display: 'block', marginBottom: '0.25rem' }}>
          Couleur (optionnelle) :
        </label>
        <select
          id="color"
          value={color}
          onChange={handleColorChange}
          style={{ width: '100%', padding: '0.5rem' }}
        >
          <option value="">Aucune</option>
          <option value="black">Noir</option>
          <option value="white">Blanc</option>
        </select>
      </div>

      {/* Invitation */}
      <div>
        <label htmlFor="invit" style={{ display: 'block', marginBottom: '0.25rem' }}>
          Invitation (ID de la room) :
        </label>
        <input
          id="invit"
          type="text"
          value={invit}
          onChange={handleInvitChange}
          placeholder="Ex: room-456"
          style={{ width: '100%', padding: '0.5rem' }}
        />
      </div>

      {/* Boutons */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleJoinByColor}
          disabled={loading || !userId.trim()}
          style={{
            padding: '0.5rem',
            backgroundColor: loading || !userId.trim() ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !userId.trim() ? 'not-allowed' : 'pointer',
            flex: 1,
          }}
        >
          {loading ? 'Connexion...' : 'Rejoindre par couleur'}
        </button>

        <button
          onClick={handleJoinByInvit}
          disabled={loading || !userId.trim() || !invit.trim()}
          style={{
            padding: '0.5rem',
            backgroundColor: loading || !userId.trim() || !invit.trim() ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !userId.trim() || !invit.trim() ? 'not-allowed' : 'pointer',
            flex: 1,
          }}
        >
          {loading ? 'Connexion...' : 'Rejoindre par invitation'}
        </button>
      </div>

      {/* Erreurs */}
      {error && (
        <p style={{ color: 'red', margin: 0, padding: '0.5rem', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          ❌ {error}
        </p>
      )}

      {/* Résultat */}
      {result && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: result.status === 'waiting' ? '#e7f3ff' : '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #b3d9ff',
          color: '#1a1a1a'
        }}>
          {result.status === 'waiting' && (
            <>
              <p style={{ margin: 0, fontWeight: 'bold' }}>⏳ En attente d'un adversaire...</p>
              <p style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>
                🆔 ID de la room : <strong>{result.roomId}</strong>
              </p>
              <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
                (vérification automatique toutes les 2 secondes...)
              </p>
            </>
          )}
          {result.status === 'ready' && (
            <>
              <p style={{ margin: 0, fontWeight: 'bold' }}>✅ Partie trouvée !</p>
              {result.roomId && (
                <p style={{ margin: '0.5rem 0', fontSize: '1.2rem' }}>
                  🆔 ID de la room : <strong>{result.roomId}</strong>
                </p>
              )}
              {result.game && (
                <div style={{ marginTop: '1rem' }}>
                  <OthelloGame gameId={result.game.gameId} userId={userId} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default JoinGameRoom;
