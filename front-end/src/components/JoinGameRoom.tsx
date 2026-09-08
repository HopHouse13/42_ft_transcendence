import { useState } from 'react'

const API_URL = 'http://localhost:3000' // ⚠️ adapte au port réel de ton backend

type JoinResponse =
  | { status: 'waiting'; roomId: string }
  | { status: 'ready'; game: unknown }

function JoinGameRoom() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JoinResponse | null>(null)

  // Placeholder en attendant un vrai système d'auth/users.
  // Chaque clic génère un nouvel id -> pratique pour tester le matchmaking
  // en ouvrant 2 onglets et en cliquant sur les deux.
  const [userId] = useState(() => crypto.randomUUID())

  const handleJoin = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/game-room/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (!response.ok) {
        throw new Error(`Le serveur a répondu ${response.status}`)
      }

      const data: JoinResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>userId (test) : {userId}</p>

      <button onClick={handleJoin} disabled={loading}>
        {loading ? 'Connexion...' : 'Entrer dans une game room'}
      </button>

      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      {result?.status === 'waiting' && (
        <p>En attente d'un adversaire… (room {result.roomId})</p>
      )}

      {result?.status === 'ready' && (
        <div>
          <p>Partie trouvée !</p>
          <pre>{JSON.stringify(result.game, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default JoinGameRoom
