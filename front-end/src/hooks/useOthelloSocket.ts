import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { GameState } from '../types/game'

const SOCKET_URL = 'http://localhost:3000/othello' // ⚠️ adapte au port réel du backend

interface UseOthelloSocketResult {
  game: GameState | null
  error: string | null
  connected: boolean
  playMove: (row: number, col: number) => void
}

export function useOthelloSocket(gameId: string, userId: string): UseOthelloSocketResult {
  const socketRef = useRef<Socket | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(SOCKET_URL)
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('joinGame', { gameId, userId })
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    // Réponse complète (cells, validMoves, players, currentPlayer...)
    socket.on('gameState', (state: GameState) => {
      setGame(state)
      setError(null)
    })

    // Le serveur ne renvoie que { valid, board, nextPlayer, status } après un coup,
    // pas les validMoves ni les players -> on redemande l'état complet juste après.
    socket.on('moveResult', () => {
      socket.emit('joinGame', { gameId, userId })
    })

    socket.on('moveError', (payload: { message: string }) => {
      setError(payload.message)
    })

    return () => {
      socket.disconnect()
    }
  }, [gameId, userId])

  const playMove = useCallback(
    (row: number, col: number) => {
      if (!socketRef.current) return
      setError(null)
      socketRef.current.emit('playMove', {
        gameId,
        userId,
        move: { row, col },
      })
    },
    [gameId, userId],
  )

  return { game, error, connected, playMove }
}
