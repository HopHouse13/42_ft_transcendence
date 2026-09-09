import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import type { GameState } from '../types/game'

const API_URL = 'http://localhost:3000' // ⚠️ adapte au port réel du backend

type JoinResponse =
  | { status: 'waiting'; roomId: string }
  | { status: 'ready'; game: GameState; roomId?: string }

function RoomPage() {
  const { user } = useUser()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JoinResponse | null>(null)
  const [socketId, setSocketId] = useState(() => crypto.randomUUID())
  const [color, setColor] = useState('')
  const [invit, setInvit] = useState('')
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Pas d'utilisateur créé -> retour à la page de création
  useEffect(() => {
    if (!user) navigate('/')
  }, [user, navigate])

  // Polling tant qu'on est en attente
  useEffect(() => {
    if (result?.status !== 'waiting') return

    const roomId = result.roomId

    pollingRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/game-room/status/${roomId}`)
        if (!response.ok) return

        const data: JoinResponse = await response.json()
        if (data.status === 'ready') {
          setResult(data)
        }
      } catch {
        // erreur réseau ponctuelle, on retentera au prochain tick
      }
    }, 2000)

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [result])

  // Dès que la partie est prête -> on part sur la page de jeu
  useEffect(() => {
    if (result?.status === 'ready') {
      navigate(`/game/${result.game.gameId}`)
    }
  }, [result, navigate])

  const regenerateSocketId = () => setSocketId(crypto.randomUUID())
  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => setColor(e.target.value)
  const handleInvitChange = (e: ChangeEvent<HTMLInputElement>) => setInvit(e.target.value)

  const sendPostRequest = async (endpoint: string, player: object) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/game-room/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player }),
      })

      const rawText = await response.text()

      if (!response.ok) {
        const errorData = (() => {
          try {
            return JSON.parse(rawText)
          } catch {
            return { message: rawText || 'Erreur inconnue' }
          }
        })()
        throw new Error(errorData.message || `Erreur ${response.status}`)
      }

      // Backend renvoie soit du JSON (partie prête), soit une string brute (roomId en attente)
      let data: JoinResponse
      try {
        const parsed = JSON.parse(rawText)
        data = { status: 'ready', game: parsed }
      } catch {
        data = { status: 'waiting', roomId: rawText }
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinByColor = async () => {
    if (!user) return
    await sendPostRequest('entry', { userId: user.id, socketId, color: color || undefined })
  }

  const handleJoinByInvit = async () => {
    if (!user || !invit.trim()) return
    await sendPostRequest('invit', { userId: user.id, socketId, invit })
  }

  if (!user) return null // redirection en cours

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: 400 }}>
      <h2>Rejoindre une partie</h2>
      <p style={{ opacity: 0.7 }}>
        Connecté en tant que <strong>{user.username}</strong>
      </p>

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

      <div>
        <label htmlFor="color" style={{ display: 'block', marginBottom: '0.25rem' }}>
          Couleur (optionnelle) :
        </label>
        <select id="color" value={color} onChange={handleColorChange} style={{ width: '100%', padding: '0.5rem' }}>
          <option value="">Aucune</option>
          <option value="black">Noir</option>
          <option value="white">Blanc</option>
        </select>
      </div>

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

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button onClick={handleJoinByColor} disabled={loading} style={{ flex: 1, padding: '0.5rem' }}>
          {loading ? 'Connexion...' : 'Rejoindre par couleur'}
        </button>
        <button onClick={handleJoinByInvit} disabled={loading || !invit.trim()} style={{ flex: 1, padding: '0.5rem' }}>
          {loading ? 'Connexion...' : 'Rejoindre par invitation'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>❌ {error}</p>}

      {result?.status === 'waiting' && (
        <div style={{ padding: '1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', color: '#1a1a1a' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>⏳ En attente d'un adversaire...</p>
          <p style={{ margin: '0.5rem 0' }}>
            🆔 ID de la room : <strong>{result.roomId}</strong>
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', opacity: 0.7 }}>
            (vérification automatique toutes les 2 secondes...)
          </p>
        </div>
      )}
    </div>
  )
}

export default RoomPage
