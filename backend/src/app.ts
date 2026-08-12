import express from 'express';
import gameRoutes from './routes/game.routes';

const app = express();
const PORT = 3000;

// Middleware obligatoire pour qu'Express parse le JSON envoyé dans le corps
// des requêtes POST. Sans lui, req.body serait undefined dans le controller.
app.use(express.json());

// Toutes les routes définies dans game.routes.ts seront préfixées par /api
app.use('/api', gameRoutes);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
