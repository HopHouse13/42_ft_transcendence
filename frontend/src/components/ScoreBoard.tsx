interface ScoreBoardProps {
  scores: { black: number; white: number };
  currentPlayer: 'black' | 'white';
}

export default function ScoreBoard({ scores, currentPlayer }: ScoreBoardProps) {
  return (
    <div style={{ marginBottom: 16, fontFamily: 'sans-serif' }}>
      <p>Noir : {scores.black} — Blanc : {scores.white}</p>
      <p>Tour de : <strong>{currentPlayer}</strong></p>
    </div>
  );
}
