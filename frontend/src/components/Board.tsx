import { Board as BoardType } from '../types/othello.types';
import Cell from './Cell';

interface BoardProps {
  board: BoardType;
  onCellClick: (row: number, col: number) => void;
}

export default function Board({ board, onCellClick }: BoardProps) {
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: 'repeat(8, 50px)' }}>
      {board.map((row, rowIndex) =>
        row.map((cellValue, colIndex) => (
          <Cell
            key={`${rowIndex}-${colIndex}`}
            value={cellValue}
            onClick={() => onCellClick(rowIndex, colIndex)}
          />
        ))
      )}
    </div>
  );
}
