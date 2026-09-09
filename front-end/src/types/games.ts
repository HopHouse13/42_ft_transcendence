export type CellState = 'EMPTY' | 'BLACK' | 'WHITE'

export type PlayerColor = 'BLACK' | 'WHITE'

export interface GamePlayer {
  userId: string
  color: PlayerColor
  connected: boolean
}

export interface ValidMove {
  row: number
  col: number
}

export interface GameResult {
  winner: PlayerColor | null
  blackCount: number
  whiteCount: number
}

export interface GameState {
  gameId: string
  cells: CellState[] // tableau plat de 64 cases (row * 8 + col)
  status: string
  players: GamePlayer[]
  currentPlayer: PlayerColor
  validMoves: ValidMove[]
  result?: GameResult
  createdAt: string
}
