/* ========================================================================== */
/*                                                                            */
/*                                                                            */
/* ========================================================================== */

import { Injectable, NotFoundException } from '@nestjs/common';

import { randomUUID } from 'crypto';

/* -------------------------------------------------------------------------- */

export interface PlayerRoom {
    
    userId: string;
    socketId: string;
    color: string;
}

export interface GameRoom   {
    
    roomId: string ;
    player1: PlayerRoom ;
    player2?: PlayerRoom ;
    status: 'waiting' | 'ready' ;
}

/* -------------------------------------------------------------------------- */
/*                         ~~ Class GameRoomService ~~                        */
/*                                                                            */
/*  a un champs (room) de type Map<string, GameRoom>                          */
/*  chaque room a un UuId comme clée et une interface GameRoom en valeur      */
/*  les methode priver suive le concept CRUD pour manipuler le champs         */
/* -------------------------------------------------------------------------- */

@Injectable()
export class GameRoomService    {
    
    private readonly rooms = new Map<string, GameRoom>();

/* -------------------------------------------------------------------------- */
    
    private createRoom(userId: string, user: PlayerRoom): string  {
        
        const gameRoom: GameRoom = {
            
            roomId : randomUUID(),
            player1 : user,
            status : 'waiting',
        }
        
        this.rooms.set( gameRoom.roomId, gameRoom);
        return( gameRoom.roomId );
    }
    
    private readRoom(roomId: string): GameRoom  {
        
        const gameRoom = this.rooms.get(roomId);
        if (!gameRoom) {
            
            throw new NotFoundException(`${roomId} introuvable`);
        }
        return ( gameRoom );
    }
    
    private updateRoom(roomId: string, user: PlayerRoom): GameRoom  {
    
        const gameRoom = this.readRoom(roomId);
        
        gameRoom.player2 = user ;
        gameRoom.status = 'ready';
        
        this.rooms.set( gameRoom.roomId, gameRoom);
        return( gameRoom );
    }
    
    private deleteRoom(roomId: string): void    {
        
        this.rooms.delete(roomId);
    }
    
}
