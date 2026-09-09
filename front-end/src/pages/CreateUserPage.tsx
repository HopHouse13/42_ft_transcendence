import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

const API_URL = 'http://localhost:3000' // ⚠️ adapte au port réel du backend

function CreateUserPage() {
  const { user, setUser } = useUser()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        const detail = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
        throw new Error(detail ?? `Le serveur a répondu ${response.status}`)
      }

      const data = await response.json()
      setUser({ id: data.id, username: data.username, email: data.email })
      navigate('/room')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2>Créer un utilisateur</h2>

      {user && (
        <p style={{ opacity: 0.7 }}>
          Déjà connecté en tant que <strong>{user.username}</strong> —{' '}
          <button onClick={() => navigate('/room')} style={{ textDecoration: 'underline', background: 'none', border: 'none', color: '#ffd54f', cursor: 'pointer' }}>
            aller à la room
          </button>
        </p>
      )}

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
    </div>
  )
}

export default CreateUserPage
