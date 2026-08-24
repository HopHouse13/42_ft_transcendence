import { Controller, Get } from '@nestjs/common';
import { OthelloService } from './othello.service';

@Controller('othello')
export class OthelloController {
  constructor(private readonly othelloService: OthelloService) {}

  // TODO: POST /othello/games (créer une partie)
  // TODO: GET /othello/games/:id (état d'une partie)
  // TODO: POST /othello/games/:id/moves (jouer un coup)

  @Get('ping')
  ping() {
    return this.othelloService.ping();
  }
}
