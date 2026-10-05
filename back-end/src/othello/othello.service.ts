/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { PrismaService } from '../prisma/prisma.service';
import { Game } from '@prisma/client';

import { OthelloEngine } from './engine/othello-engine';

import type { Player } from './types/player.type';
import type { Move, Move as EngineMove } from './types/move.type';
import type { GameResult as EngineGameResult } from './interfaces/game-result.interface';
import type { Cell as EngineCell } from './types/cell.type';
//import type { Cell as EngineCell } from './engine/othello-board';

import { GameStatus } from './enums/game-status.enum';
import type { GameState } from './interfaces/game-state.interface';
import type { PlayerInfo } from './interfaces/player-info.interface';
import type { MoveResult } from './interfaces/move-result.interface';
import type { GameResult } from './interfaces/game-result.interface';

import { ComputePlayerService } from '../compute-player/compute-player.service';

/* ========================================================================== */

/**
 * Represente une partie
 * engine -> une instace de la class OthelloEngine
 * player -> interface PlayerInfo [ userId, color, connected
 * status -> enum GameStatus Waiting || ingame || finshed
 * createdAt -> date de la creatation de la partie
 */
type GameMode = 'BOT' | 'ONLINE';

interface GameEntry {
    gameId:         string;
    mode:           GameMode;
    engine:         OthelloEngine;
    players:        PlayerInfo[];
    status:         GameStatus;
    createdAt:      Date;
    forfeitWinner?: Player;   // renseigné si un joueur abandonne / se déconnecte trop longtemps
}

/* ========================================================================== */

@Injectable()
export class    OthelloService {

/**
 * map qui utilise gameID comme clée et lie a l'interface GameEntry
 */
    private readonly games = new Map<string, GameEntry>();
    private readonly localPlayer: PlayerInfo = { userId: randomUUID(), color: 'BLACK', connected: true };
    // userId -> gameId pour retrouver vite la partie d'un joueur
    private readonly gameByUser = new Map<string, string>();
    
    constructor( private readonly computePlayerService: ComputePlayerService, private readonly prisma: PrismaService) {}
    
/**
 * Fonction createGame and joinGame
 * createGame init interface GameEntry and add in map games ( a first players is a BLACK and hostPlayers )
 * joinGame add a new player for a game ( all time a sceond player is a 'WHITE' )
 */
    
/* --------------------------------------------------------------------------- */
    
    
    createLocalGame(hostUserId: string): GameState {

        const gameId = randomUUID();
        const gameEntry = this._initGameEntry(gameId, 'BOT', hostUserId, this.localPlayer.userId);

        this.games.set(gameId, gameEntry);
        this.registerPlayers(gameEntry);

        return this.buildGameState(gameId, gameEntry);
    }
 
/*    --------------------------------------------------------------------------- */


    async createGame(hostUserId: string, visitorUserId: string): Promise<GameState> {

        const gameId = randomUUID();
        const gameEntry = this._initGameEntry(gameId, 'ONLINE', hostUserId, visitorUserId);

        await this.prisma.game.create({
            data: { id: gameId, status: 'IN_PROGRESS', blackPlayerId: hostUserId, whitePlayerId: visitorUserId },
        });

        // On n'enregistre en mémoire qu'après le succès de la base
        this.games.set(gameId, gameEntry);
        this.registerPlayers(gameEntry);

        return this.buildGameState(gameId, gameEntry);
    }

    async joinGame(gameId: string, userId: string): Promise<GameState> {

        const gameEntry = this._getGameEntry(gameId);
        if (gameEntry.players.length >= 2) {
            throw new BadRequestException(`La partie ${gameId} est déjà complète`);
        }

        gameEntry.players.push({ userId, color: 'WHITE', connected: true });
        gameEntry.status = GameStatus.IN_PROGRESS;
        this.registerPlayers(gameEntry);

        await this.prisma.game.update({
            where: { id: gameId },
            data: { whitePlayerId: userId, status: 'IN_PROGRESS' },
        });

        return this.buildGameState(gameId, gameEntry);
    }
    
/**
 *
 *
 */
    
    playLocalMove(gameId: string, userId: string, move: Move): MoveResult {
        return this._applyMove(gameId, userId, move);
    }

    playMove(gameId: string, userId: string, move: Move): MoveResult {
        return this._applyMove(gameId, userId, move);
    }

    private _applyMove(gameId: string, userId: string, move: Move): MoveResult {

        const entry = this._getGameEntry(gameId);
        if (entry.status !== GameStatus.IN_PROGRESS) {
            throw new BadRequestException(`La partie ${gameId} n'est pas en cours`);
        }

        const playerInfo = entry.players.find((p) => p.userId === userId);
        if (!playerInfo) {
            throw new BadRequestException(`Joueur ${userId} ne fait pas partie de cette partie`);
        }

        try {
            entry.engine.playMove({ row: move.row, col: move.col }, playerInfo.color);
        } catch {
            throw new BadRequestException(`Coup invalide en (${move.row}, ${move.col})`);
        }

        //-- >> await this.prisma.move.create(...)  (à adapter à ton nouveau modèle Move)

        const gameOver = this._updateStatus(entry);   // d'abord le status...
        const result = this._setMoveResult(entry);    // ...puis le résultat
        if (gameOver) {
            result.result = this._buildResult(entry);
        }
        return result;
    }
    
    async findAll(): Promise<Game[]> {
        
        return( this.prisma.game.findMany({ orderBy: { createdAt: 'desc' } }) );
    }
/**
 * Methode getState
 * retourne l interface GameState qui corespons a l'id de la partie ( gameId )
 */

    async getState(gameId: string): Promise<GameState>   {
        
        const gameEntry = this._getGameEntry(gameId);
    //   const gameEntry = await this._getOrRestoreGameEntry(gameId);
        
        return( this.buildGameState(gameId, gameEntry) );
    }
    

/**
 * Methode marckDisconnected: change la valeur de player.conected en false
 *  si il ne trouve pas d interface GameEntry corespondant a gameID s'arrete
 *  si il trouve dans playerInfo un userID change la valeur de connected en false
 */
    markDisconnected(gameId: string, userId: string):   void    {

        const gameEntry = this.games.get(gameId);
        if (!gameEntry)
          return;

        const player = gameEntry.players.find((p) => p.userId === userId);
        if ( player )
            player.connected = false;
    }

// ~~ private Method: _initGameEntry | _getGameEntry | buildGameState | serializeBoard | toGameResult ~~ //
    //private async _getOrRestoreGameEntry(gameId: string): Promise<GameEntry> {

    //    const cached = this.games.get(gameId);
    //    if (cached) {
    //        return cached;
    //    }

    //    const dbGame = await this.prisma.game.findUnique({
    //        where: { id: gameId },
    //        include: { moves: { orderBy: { moveNumber: 'asc' } } },
    //    });

    //    if (!dbGame) {
    //        throw new NotFoundException(`Partie ${gameId} introuvable`);
    //    }

    //    const engine = new OthelloEngine();

    //    for (const m of dbGame.moves) {
    //        if (m.position === null) continue; // pass

    //        const row = Math.floor(m.position / 8);
    //        const col = m.position % 8;

    //        engine.playMove({ row, col }, m.Color as Player);
    //    }

    //    const players: PlayerInfo[] = [
    //        { userId: dbGame.blackPlayerId, color: 'BLACK', connected: false },
    //        { userId: dbGame.whitePlayerId, color: 'WHITE', connected: false },
    //    ];

        const restored: GameEntry = {
            gameId,
            mode: 'ONLINE',          // la base ne stocke que les parties en ligne
            engine,
            players,
            status: dbGame.status as GameStatus,
            createdAt: dbGame.createdAt,
        };

        this.games.set(gameId, restored);
        if (restored.status === GameStatus.IN_PROGRESS) this.registerPlayers(restored);

    //    return restored;
    //}
/*
    private async _getOrRestoreGameEntry(gameId: string): Promise<GameEntry>    {

            const cached = this.games.get(gameId);
            if (cached) {
         
                return( cached );
            }
        
            const dbGame = await this.prisma.game.findUnique({ where: { id: gameId }, include: { moves: { orderBy: { createdAt: 'asc' }}} });

            if (!dbGame) {
                
                throw new NotFoundException(`Partie ${gameId} introuvable`);
            }

            const engine = new OthelloEngine();
            for (const m of dbGame.moves) {
                
                engine.playMove({ row: m.row, col: m.col }, m.player as Player);
            }

            const players: PlayerInfo[] = [ { userId: dbGame.playerBlack, color: 'BLACK', connected: false } ];
            
            if (dbGame.playerWhite) {
            
                players.push({ userId: dbGame.whitePlayer, color: 'WHITE', connected: false });
            }

            const restored: GameEntry = {
            
            engine,
            players,
            status: dbGame.status as GameStatus,
            createdAt: dbGame.createdAt,
            
            };

            this.games.set(gameId, restored);
            
            return( restored) ;
        }
 */
    isBotTurn(gameId: string): boolean {

        const game = this.games.get(gameId);
        if (!game) return false;

        const botPlayer = game.players.find(p => p.userId === this.localPlayer.userId);
        return !!botPlayer
            && game.engine.getCurrentPlayer() === botPlayer.color
            && !game.engine.isGameOver();
    }

    async playBotTurn(gameId: string): Promise<GameState | undefined> {

        const game = this.games.get(gameId);
        if (!game || game.mode !== 'BOT') return;

        const botPlayer = game.players.find((p) => p.userId === this.localPlayer.userId);
        if (!botPlayer) return;

        const botColor = botPlayer.color;
        const engine = game.engine;

        // Boucle : le bot rejoue tant que l'humain n'a aucun coup valide
        while (game.status === GameStatus.IN_PROGRESS
            && engine.getCurrentPlayer() === botColor
            && !engine.isGameOver()) {

            const legalMoves = engine.allValidMove(botColor);
            const move = await this.computePlayerService.requestMove(
                this.serializeBoard(engine), botColor, legalMoves,
            );

            if (!move) break;   // évite la boucle infinie si le bot ne répond pas
            engine.playMove(move, botColor);
        }

        this._updateStatus(game);
        return this.buildGameState(gameId, game);
    }
    
    /** État de la partie en cours de ce joueur, ou null s'il n'en a pas. */
    getActiveGameState(userId: string): GameState | null {

        const gameId = this.gameByUser.get(userId);
        if (!gameId) return null;

        const entry = this.games.get(gameId);
        if (!entry || entry.status !== GameStatus.IN_PROGRESS) {
            this.gameByUser.delete(userId);
            return null;
        }
        return this.buildGameState(gameId, entry);
    }

    markConnected(gameId: string, userId: string): void {
        const player = this.games.get(gameId)?.players.find((p) => p.userId === userId);
        if (player) player.connected = true;
    }

    // markDisconnected reste inchangée

    /** Abandon (ou délai de reconnexion dépassé) : l'adversaire gagne. */
    forfeit(gameId: string, userId: string): GameState | undefined {

        const entry = this.games.get(gameId);
        if (!entry || entry.status !== GameStatus.IN_PROGRESS) return;

        const loser = entry.players.find((p) => p.userId === userId);
        if (!loser) return;

        entry.forfeitWinner = loser.color === 'BLACK' ? 'WHITE' : 'BLACK';
        entry.status = GameStatus.FINISHED;
        this.unregisterPlayers(entry);

        return this.buildGameState(gameId, entry);
    }
    
    async remove(gameId: string): Promise<Game> {
        try {
            const deleted = await this.prisma.$transaction(async (tx) => {
                await tx.move.deleteMany({ where: { gameId } });
                return tx.game.delete({ where: { id: gameId } });
            });

            const entry = this.games.get(gameId);
            if (entry) this.unregisterPlayers(entry);
            this.games.delete(gameId);

            return deleted;
        } catch (error) {
            if (error.code === 'P2025') {
                throw new NotFoundException(`Partie ${gameId} introuvable`);
            }
            throw error;
        }
    }
/**
 * Private Methode _initGameEntry and _getGameEntry for use a interface GameEntry
 *
 * _initGameEntry -> set a new engine, first player(host player) in black, set Status and set a Date
 * _getGameEntry  -> return all interface or up Exeption if bad gameId or GameEntry no existe
 */
    /* --------------------------------------------------------------------------- */

    private _getGameEntry(gameId: string): GameEntry {

        const gameEntry = this.games.get(gameId);
        if (!gameEntry) {
            throw new NotFoundException(`Partie ${gameId} introuvable`);
        }

        return gameEntry;
    }

    private _setMoveResult(gameEntry: GameEntry):  MoveResult {
        
        const moveResult: MoveResult = {

            valid: true,
            board: this.serializeBoard(gameEntry.engine),
            nextPlayer: gameEntry.engine.getCurrentPlayer(),
            validMove: gameEntry.engine.allValidMove(gameEntry.engine.getCurrentPlayer()),
            status: gameEntry.status,
        };
        
        return( moveResult );
    }
//                   ~~ ~~                     //
/**
 * Private Methode buildGameState: retourne un interface GameState construite a partir de games( Map<gameId, GameEntry> )
 *
 */
    private registerPlayers(entry: GameEntry): void {
        for (const p of entry.players) {
            if (p.userId !== this.localPlayer.userId) {
                this.gameByUser.set(p.userId, entry.gameId);
            }
        }
    }

    private unregisterPlayers(entry: GameEntry): void {
        for (const p of entry.players) {
            // ne supprime que si l'entrée pointe encore vers CETTE partie
            if (this.gameByUser.get(p.userId) === entry.gameId) {
                this.gameByUser.delete(p.userId);
            }
        }
    }

    /** Met à jour le status depuis le moteur ; libère les joueurs si la partie est finie. */
    private _updateStatus(entry: GameEntry): boolean {
        const over = entry.engine.isGameOver();
        entry.status = over ? GameStatus.FINISHED : GameStatus.IN_PROGRESS;
        if (over) this.unregisterPlayers(entry);
        return over;
    }

    private _buildResult(entry: GameEntry): GameResult | undefined {
        if (entry.status !== GameStatus.FINISHED) return undefined;

        const result = this.toGameResult(entry.engine.returnResult());
        return entry.forfeitWinner ? { ...result, winner: entry.forfeitWinner } : result;
    }

    private _initGameEntry(gameId: string, mode: GameMode, hostUserId: string, visitorUserId: string): GameEntry {
        return {
            gameId,
            mode,
            engine:    new OthelloEngine(),
            players:   [{ userId: hostUserId,    color: 'BLACK', connected: true },
                        { userId: visitorUserId, color: 'WHITE', connected: true }],
            status:    GameStatus.IN_PROGRESS,
            createdAt: new Date(),
        };
    }

    private buildGameState(gameId: string, gameEntry: GameEntry): GameState {

        const currentPlayer = gameEntry.engine.getCurrentPlayer();

        return {
            gameId,
            mode: gameEntry.mode,                       // <-- ajouté
            cells: this.serializeBoard(gameEntry.engine),
            status: gameEntry.status,
            players: gameEntry.players,
            currentPlayer,
            validMoves: gameEntry.engine.allValidMove(currentPlayer),
            result: this._buildResult(gameEntry),       // <-- gère aussi les abandons
            createdAt: gameEntry.createdAt,
        };
    }
/**
 * Private Methode serializeBoard: fait une copy du plateaux du moteur de jeux dans un tableaux unidirectionel EngineCell[]
 *
 */
  private serializeBoard(engine: OthelloEngine): EngineCell[] {

    const board = engine.getBoard();  const cells: EngineCell[] = [];
    for (let row = 0; row < 8; row++)
    {
      for (let col = 0; col < 8; col++) {
      
        cells.push(board.getCell(row, col));
      }
    }
      
    return( cells );
  }

/**
 * Private Methode toGameResult: retourne une interface GameResult
 */
  private toGameResult(r: EngineGameResult): GameResult {

    return( { winner: r.winner, blackCount: r.blackCount, whiteCount: r.whiteCount } );
  }

}
/* model
 Game {
 id                String @id @default( uuid() ) @db.Uuid
 
 status            GameStatus @default( IN_PROGRESS ) // ou WAITING
 
 blackPlayerId    String @db.Uuid @map( "black_player_id" )
 whitePlayerId    String @db.Uuid @map( "white_player_id" )

 winnerId        String? @db.Uuid @map( "winner_id" )
 blackScore        Int? @map( "black_score" )
 whiteScore        Int? @map( "white_score" )

 currentPlayer    PlayerColor @default( BLACK ) @map( "current_player" )

 createdAt        DateTime @default( now() ) @map( "created_at" )
 updatedAt        DateTime @updatedAt @map( "updated_at" )

 moves            Move[] // ca represente l'ensemble les moves avec l'id de cette game dans la table Move

 blackPlayer        User @relation( "black", fields: [ blackPlayerId ], references: [ id ] ) // créer une contriante entre Game et User
 whitePlayer        User @relation( "white", fields: [ whitePlayerId ], references: [ id ] )
 winner            User? @relation( "winner", fields: [ winnerId ], references: [ id ] ) // Si null -> draw
 
 @@map( "games" )
}

model Move {
 gameId            String @db.Uuid @map( "game_id" )
 moveNumber        Int @map( "move_number" )

 Color            PlayerColor @map( "color_player" )
 position        Int? // peut etre null si pass

 boardAfter        String @db.Char( 64 ) @map( "board_after" )

 createdAt        DateTime @default( now() ) @map( "created_at" )

 game            Game @relation( fields: [ gameId ], references: [ id ] ) // créer une contrainte entre la table Game et la table Move. Elle sont liées par gameId de Game et gameId de Move

 @@id([ gameId, moveNumber ], name: "movesInGame" ) // genere une clé primaire composite a partir des champs renseignés
 @@map( "moves" )
}
*/
