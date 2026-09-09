import { useOthelloSocket } from '../hooks/useOthelloSocket'
import OthelloBoard from './OthelloBoard'

function OthelloGame({ gameId, userId }: { gameId: string; userId: string }) {
  const { game, error, connected, playMove } = useOthelloSocket(gameId, userId)

  if (!connected) {
    return <p>Connexion au serveur de jeu...</p>
  }

  if (!game) {
    return <p>Chargement de la partie...</p>
  }

  const myPlayer = game.players.find((p) => p.userId === userId)
  const isMyTurn = myPlayer?.color === game.currentPlayer

  return (
    <div>
      {error && (
        <p style={{ color: 'red', margin: '0 0 0.5rem 0' }}>⚠️ {error}</p>
      )}

      <OthelloBoard game={game} onCellClick={isMyTurn ? playMove : undefined} />

      {game.status !== 'FINISHED' && (
        <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>
          {isMyTurn ? 'À toi de jouer.' : "En attente du coup de l'adversaire..."}
        </p>
      )}

      {game.status === 'FINISHED' && game.result && (
        <p style={{ fontWeight: 'bold', marginTop: '0.5rem' }}>
          🏁 Partie terminée — {game.result.winner ? `${game.result.winner} gagne` : 'égalité'}
          {' '}({game.result.blackCount} - {game.result.whiteCount})
        </p>
      )}
    </div>
  )
}

export default OthelloGame
