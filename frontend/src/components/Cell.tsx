import { Cell as CellType } from '../types/othello.types';

interface CellProps {
  value: CellType;
  onClick: () => void;
}

// Un composant reçoit des "props" (ici value et onClick) — ce sont ses paramètres d'entrée.
// Chaque fois que "value" change, React redessine automatiquement cette case.
export default function Cell({ value, onClick }: CellProps) {
  return (
    <div
      onClick={onClick}
      style={{
        width: 50,
        height: 50,
        backgroundColor: '#2e7d32',
        border: '1px solid #1b5e20',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {value !== 'empty' && (
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            backgroundColor: value === 'black' ? '#111' : '#fafafa',
          }}
        />
      )}
    </div>
  );
}
