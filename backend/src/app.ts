import express from 'express';
const app = express();
const PORT = 3000;

app.get('/api/game', (req, res) => {
  res.json({ message: "Othello API is running!" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
