import express from 'express';
import cors from 'cors';
import gameRoutes from './routes/game.routes';
import { checkDatabaseConnection } from './db/pool';

const app = express();
const PORT = 3000;


// Autorise les requêtes venant du front-end (localhost:5173)
// Sans ça, le navigateur bloque la réponse avant même qu'elle atteigne ton code React
app.use(cors({ origin: 'http://localhost:5173' }));

// Middleware obligatoire pour qu'Express parse le JSON envoyé dans le corps
// des requêtes POST. Sans lui, req.body serait undefined dans le controller.
app.use(express.json());

// Toutes les routes définies dans game.routes.ts seront préfixées par /api
app.use('/api', gameRoutes);

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  await checkDatabaseConnection();
});
