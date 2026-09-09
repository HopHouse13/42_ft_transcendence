import { useState } from 'react'

const API_URL = 'http://localhost:3000' // ⚠️ adapte au port réel de ton backend

type User = {
  id: string
  username: string
  email: string
  [key: string]: unknown // le backend peut renvoyer d'autres champs (createdAt, etc.)
}

function CreateUser() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<User | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)
    setUser(null)

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })

      if (!response.ok) {
        // ValidationPipe renvoie un 400 avec le détail des erreurs dans le body
        const body = await response.json().catch(() => null)
        const detail = Array.isArray(body?.message)
          ? body.message.join(', ')
          : body?.message
        throw new Error(detail ?? `Le serveur a répondu ${response.status}`)
      }

      const data: User = await response.json()
      setUser(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Créer un utilisateur</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: 300 }}>
        <input
          type="text"
          placeholder="username (3-50 caractères)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleCreate} disabled={loading || !username || !email}>
          {loading ? 'Création...' : 'Créer le user'}
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>Erreur : {error}</p>}

      {user && (
        <div>
          <p>Utilisateur créé :</p>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}

export default CreateUser
