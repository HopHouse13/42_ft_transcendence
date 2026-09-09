import type { GameState, ValidMove } from '../types/game'

const BOARD_SIZE = 8

function isValidMove(row: number, col: number, validMoves: ValidMove[]): boolean {
  return validMoves.some((m) => m.row === row && m.col === col)
}

function OthelloBoard({
  game,
  onCellClick,
}: {
  game: GameState
  onCellClick?: (row: number, col: number) => void
}) {
  const player = (color: 'BLACK' | 'WHITE') =>
    game.players.find((p) => p.color === color)

  const black = player('BLACK')
  const white = player('WHITE')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '2rem', fontSize: '0.95rem' }}>
        <span style={{ fontWeight: game.currentPlayer === 'BLACK' ? 'bold' : 'normal' }}>
          ⚫ Noir {black ? `(${black.userId.slice(0, 8)}…)` : ''}
          {game.currentPlayer === 'BLACK' && ' ← à toi de jouer'}
        </span>
        <span style={{ fontWeight: game.currentPlayer === 'WHITE' ? 'bold' : 'normal' }}>
          ⚪ Blanc {white ? `(${white.userId.slice(0, 8)}…)` : ''}
          {game.currentPlayer === 'WHITE' && ' ← à toi de jouer'}
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 48px)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 48px)`,
          gap: '2px',
          backgroundColor: '#2d4a2d',
          padding: '8px',
          borderRadius: '4px',
        }}
      >
        {game.cells.map((cell, index) => {
          const row = Math.floor(index / BOARD_SIZE)
          const col = index % BOARD_SIZE
          const valid = isValidMove(row, col, game.validMoves)

          return (
            <div
              key={index}
              onClick={valid && onCellClick ? () => onCellClick(row, col) : undefined}
              style={{
                width: 48,
                height: 48,
                backgroundColor: '#3a7a3a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: valid ? '2px solid #ffd54f' : '1px solid #2d4a2d',
                boxSizing: 'border-box',
                cursor: valid && onCellClick ? 'pointer' : 'default',
              }}
            >
              {cell === 'BLACK' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#111', boxShadow: '1px 1px 3px rgba(0,0,0,0.5)' }} />
              )}
              {cell === 'WHITE' && (
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f5f5f5', boxShadow: '1px 1px 3px rgba(0,0,0,0.5)' }} />
              )}
              {cell === 'EMPTY' && valid && (
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ffd54f' }} />
              )}
            </div>
          )
        })}
      </div>

      <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>Statut de la partie : {game.status}</p>
    </div>
  )
}

export default OthelloBoard
