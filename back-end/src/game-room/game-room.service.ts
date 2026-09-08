/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { OthelloService } from '../othello/othello.service';
import type { GameState } from '../othello/interfaces/game-state.interface';

/* -------------------------------------------------------------------------- */

export interface PlayerRoom {
    
    userId:      string;
    socketId:    string;
    color?:      string;
    
    invit?:      string
}

export interface GameRoom   {
    
    roomId:     string ;
    player1:    PlayerRoom ;
    player2?:   PlayerRoom ;
    status:     'waiting' | 'ready' ;
}

/* -------------------------------------------------------------------------- */
/*                         ~~ Class GameRoomService ~~                        */
/*                                                                            */
/*  a un champs (room) de type Map<string, GameRoom>                          */
/*  chaque room a un UuId comme clée et une interface GameRoom en valeur      */
/*  le constructeur cree une instance de othelloService                       */
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  newPlayerEntry --> match deux joeur en fonction de la couleur             */
/*  invitPlayerEntry --> gestion de la cration partie par invite              */
/*  les methode priver suive le concept CRUD pour manipuler le champs         */
/* -------------------------------------------------------------------------- */

@Injectable()
export class GameRoomService    {
    
    private readonly rooms = new Map<string, GameRoom>();


    constructor(private readonly othelloService: OthelloService) {}

/* -------------------------------------------------------------------------- */

    /* -------------------------------------------------------------------------- */
    /*  1. Cherche une room en attente compatible                                 */
    /*  2. Aucune room compatible trouvée → on en crée une nouvelle               */
    /*  3. Room trouvée → on y ajoute le joueur comme player2                     */
    /*  4. La room est prête → on lance la partie et on supprime la room          */
    /* -------------------------------------------------------------------------- */

    newPlayerEntry(player: PlayerRoom): string | Promise<GameState> {

        const waitingRoom = this._findWaitingRoom(player);
        if (!waitingRoom)   {
            
            return( this._createRoom(player.userId, player) );
        }

        const readyRoom = this._updateRoom(waitingRoom.roomId, player);
        const game = this.othelloService.createGame( readyRoom.player1.userId, readyRoom.player2!.userId );

        this._deleteRoom(readyRoom.roomId);
        return( game );
    }

    /* -------------------------------------------------------------------------- */
    /*  Pas d'invit → on crée une nouvelle room et on retourne son id             */
    /*  Un invit est fourni → on rejoint la room correspondante                   */
    /* -------------------------------------------------------------------------- */

    invitPlayerEnty(player: PlayerRoom)     {

        if (!player.invit)  {
            
            return( this._createRoom(player.userId, player) );
        }

        const room = this._readRoom(player.invit);
        const readyRoom = this._updateRoom(room.roomId, player);
        const game = this.othelloService.createGame( readyRoom.player1.userId, player.userId );

        this._deleteRoom(readyRoom.roomId);
        return( game );
    }

    /* -------------------------------------------------------------------------- */
    /*  Garde-fou : on ne peut pas rejoindre sa propre room                       */
    /*  Si le joueur a une couleur préférée, on cherche une room                  */
    /*  dont le player1 a la couleur opposée (ou pas de préférence)               */
    /*  Pas de préférence de couleur → n'importe quelle room en attente convient  */
    /* -------------------------------------------------------------------------- */

    private _findWaitingRoom(player: PlayerRoom): GameRoom | undefined {

        for ( const room of this.rooms.values() )  {

            if (room.status !== 'waiting') continue;
           
            if (room.player1.userId === player.userId) continue;

            if (player.color) {
                
                if (!room.player1.color || room.player1.color !== player.color) {
                    
                    return( room );
                }
                continue;
            }
            
            return( room );
        }

        return( undefined );
    }
    
/* -------------------------------------------------------------------------- */
    
    private _createRoom(userId: string, user: PlayerRoom): string  {
        
        const gameRoom: GameRoom = {
            
            roomId : randomUUID(),
            player1 : user,
            status : 'waiting',
        }
        
        this.rooms.set( gameRoom.roomId, gameRoom);
        return( gameRoom.roomId );
    }
    
    private _readRoom(roomId: string): GameRoom  {
        
        const gameRoom = this.rooms.get(roomId);
        if (!gameRoom) {
            
            throw new NotFoundException(`${roomId} introuvable`);
        }
        return ( gameRoom );
    }
    
    private _updateRoom(roomId: string, user: PlayerRoom): GameRoom  {
    
        const gameRoom = this._readRoom(roomId);
        
        gameRoom.player2 = user ;
        gameRoom.status = 'ready';
        
        this.rooms.set( gameRoom.roomId, gameRoom);
        return( gameRoom );
    }
    
    private _deleteRoom(roomId: string): void    {
        
        this.rooms.delete(roomId);
    }
    
}
