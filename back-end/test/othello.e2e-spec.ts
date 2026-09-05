
// test/othello.e2e-spec.ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { io, Socket } from 'socket.io-client';
import { AppModule } from '../src/app.module';

describe('OthelloGateway (e2e)', () => {
  let app: INestApplication;
  let clientSocket: Socket;
  const PORT = 3001;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach((done) => {
    clientSocket = io(`http://localhost:${PORT}/othello`, {
      transports: ['websocket'],
    });
    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.disconnect();
  });

  it('reçoit gameState après joinGame', (done) => {
    clientSocket.on('gameState', (state) => {
      expect(state.gameId).toBe('un-game-id-existant');
      done();
    });

    clientSocket.emit('joinGame', {
      gameId: 'un-game-id-existant',
      userId: 'user1',
    });
  });

  it('reçoit moveError sur un coup invalide', (done) => {
    clientSocket.on('moveError', (err) => {
      expect(err.message).toBeDefined();
      done();
    });

    clientSocket.emit('playMove', {
      gameId: 'un-game-id-existant',
      userId: 'user1',
      move: { row: 0, col: 0 }, // coup invalide selon les règles d'Othello
    });
  });
});
