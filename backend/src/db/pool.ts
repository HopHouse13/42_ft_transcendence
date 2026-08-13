import { Pool } from 'pg';

// Un "pool" garde plusieurs connexions ouvertes en réserve, réutilisées
// entre les requêtes plutôt que d'en ouvrir une nouvelle à chaque fois
// (ouvrir une connexion est une opération lente comparée à l'utiliser)
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Petite vérification au démarrage : confirme que la base répond bien
export async function checkDatabaseConnection(): Promise<void> {
  try {
    await pool.query('SELECT 1');
    console.log('Connexion à PostgreSQL établie');
  } catch (error) {
    console.error('Impossible de se connecter à PostgreSQL :', error);
  }
}
