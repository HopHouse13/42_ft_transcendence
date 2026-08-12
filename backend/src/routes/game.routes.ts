import { Router } from 'express';
import { getGameState, playMove, resetGame } from '../controllers/game.controller';

const router = Router();

router.get('/game', getGameState);
router.post('/game/move', playMove);
router.post('/game/reset', resetGame);

export default router;
