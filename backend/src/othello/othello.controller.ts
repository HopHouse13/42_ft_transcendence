import { Controller, Param, Body, Get, Post, Patch, Delete } from '@nestjs/common';
import { OthelloService } from './othello.service';

import { ParseUUIDPipe } from '@nestjs/common';
import { MoveDto } from './dto/play-move.dto';

import type { Move } from './types/move.type' ;
import type { MoveResult } from './interfaces/move-result.interface';
import type { GameResult } from './interfaces/game-result.interface';


@Controller('engine')
export class OthelloController {

    constructor(private readonly othelloService: OthelloService) {}

  // TODO: POST /othello/games (créer une partie)
  // TODO: GET /othello/games/:id (état d'une partie)
  // TODO: POST /othello/games/:id/moves (jouer un coup)

}
