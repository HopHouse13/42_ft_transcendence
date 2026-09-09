import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import OthelloGame from '../components/OthelloGame'

function GamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const { user } = useUser()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/')
  }, [user, navigate])

  if (!user || !gameId) return null // redirection en cours

  return (
    <div>
      <h2>Partie en cours</h2>
      <OthelloGame gameId={gameId} userId={user.id} />
    </div>
  )
}

export default GamePage
