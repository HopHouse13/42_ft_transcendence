/* ========================================================================== */
/*  OthelloGateway : aligné sur les events du front (useGameSocket.ts)        */
/*                                                                            */
/*  Le front EMET : findMatch | createBotGame | playMove                      */
/*  Le front ECOUTE : waiting | matchFound | moveApplied | moveRejected |     */
/*                    gameState | gameError | botThinking | botError          */
/* ========================================================================== */

import {
    WebSocketGateway, WebSocketServer, SubscribeMessage,
    MessageBody, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';

import { OthelloService } from './othello.service';
import { MoveDto } from './dto/play-move.dto';

/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */

// Namespace par défaut ('/') : le front fait io(window.location.origin)
// à restreindre en prod (ton front uniquement)
@WebSocketGateway({ cors: { origin: '*' } })
export class OthelloGateway implements OnGatewayConnection, OnGatewayDisconnect {

    @WebSocketServer() server: Server;
    constructor(private readonly othelloService: OthelloService) {}

    /* -------------------------------------------------------------------------- */
    /*  Connexion / déconnexion                                                   */
    /* -------------------------------------------------------------------------- */

    handleConnection(client: Socket) {
        
        console.log(`${new Date().toISOString()} by: client Conect(${client.id}) to: Othello engine`);
    }

    handleDisconnect(client: Socket) {
        
        console.log(`${new Date().toISOString()} by: client Disconect(${client.id}) to: Othello engine`);
    }

    /* -------------------------------------------------------------------------- */


}
