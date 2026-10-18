import type { Cell } from '../types/gameTypes';

interface MyCellProps {
  cell: Cell;
  index: number;
  validMoves: number[];
  onCellClick?: (index: number) => void;
}

interface MyBoardProps {
  board?: Cell[];
  validMoves?: number[];
  onCellClick?: (index: number) => void;
}

/* --------------------------------------------------------------------------------------------- */
/*                                          ~~ MyCell ~~                                         */
/* --------------------------------------------------------------------------------------------- */

// 1. Composant MyCell avec destructuration propre des props
// function MyCell({ cell, index, validMoves, onCellClick }: MyCellProps) {

//   const isValidMove = validMoves.includes(index);

//   return (
//     <div className=''>
//     	<button
// 			key={index}
// 			onClick={() => onCellClick && onCellClick(index)}
// 			className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 aspect-square
// 				${(index + Math.floor(index / 8)) % 2 === 0 ? 'bg-secondary' : 'bg-primary'}
// 				hover: shadow-[inset_0_0.2px_1.5px_rgba(0,0,0,0.2)] flex items-center justify-center relative transition-colors
// 				${index === 0 ? 'rounded-tl-md' : index === 7 ? 'rounded-tr-md' : index === 56 ? 'rounded-bl-md' : index === 63 ? 'rounded-br-md' : 'rounded-none'} `}
// 		>
//         {/* Jeton Noir */}
//         {cell === 'BLACK' && (
//           <div className='w-7/10 h-7/10 rounded-full bg-radial from-gray-700 via-gray-950 to-black shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-black/40 transform transition-all duration-300 scale-100' />
//         )}

//         {/* Jeton Blanc */}
//         {cell === 'WHITE' && (
//           <div className='w-7/10 h-7/10 rounded-full bg-radial from-white via-slate-100 to-slate-300 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] border border-slate-300 transform transition-all duration-300 scale-100' />
//         )}

//         {/* Indicateur de coup valide */}
//         {isValidMove && !cell && (
//           <div className='w-3 h-3 bg-stone-800/40 rounded-full animate-pulse' />
//         )}
//       </button>
//     </div>
//   );
// }

function MyCell({ cell, index, validMoves, onCellClick }: MyCellProps) {
  const isValidMove = validMoves.includes(index);

  return (
    // 1. Replaced <button> with a <div> to bypass the browser's 400px intrinsic sizing limit.
    // 2. Removed 'aspect-square' from the cell so it obeys the parent grid.
    <div
      onClick={() => onCellClick && onCellClick(index)}
      className={`w-full h-full flex items-center justify-center relative transition-colors cursor-pointer
        ${(index + Math.floor(index / 8)) % 2 === 0 ? 'bg-secondary' : 'bg-primary'}
        hover:shadow-[inset_0_0.2px_1.5px_rgba(0,0,0,0.2)]
        ${index === 0 ? 'rounded-tl-md' : index === 7 ? 'rounded-tr-md' : index === 56 ? 'rounded-bl-md' : index === 63 ? 'rounded-br-md' : 'rounded-none'} `}
    >
      {/* Your native Tailwind v4 tokens untouched */}
      {cell === 'BLACK' && (
          <div className='w-7/10 h-7/10 rounded-full bg-radial from-gray-700 via-gray-950 to-black shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.3)] border border-black/40 transform transition-all duration-300 scale-100' />
      )}

      {cell === 'WHITE' && (
          <div className='w-7/10 h-7/10 rounded-full bg-radial from-white via-slate-100 to-slate-300 shadow-[0_4px_6px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_2px_4px_rgba(255,255,255,1)] border border-slate-300 transform transition-all duration-300 scale-100' />
      )}

      {isValidMove && !cell && (
        <div className='absolute w-[25%] h-[25%] bg-stone-800/40 rounded-full animate-pulse' />
      )}
    </div>
  );
}

/* --------------------------------------------------------------------------------------------- */
/*                                           ~~ Board ~~                                         */
/* --------------------------------------------------------------------------------------------- */
// 2. Composant MyBoard
// function MyBoard({ board, validMoves = [], onCellClick }: MyBoardProps) {
//   // Grille par défaut 8x8
//   const defaultBoard: Cell[] = Array(64).fill(null);
//   defaultBoard[27] = 'WHITE';
//   defaultBoard[28] = 'BLACK';
//   defaultBoard[35] = 'BLACK';
//   defaultBoard[36] = 'WHITE';

//   const currentBoard = board || defaultBoard;

//   return (
//     <div className='flex justify-center items-center bg-[url(/wood.svg)] rounded-lg shadow-xl p-3 aspect-square'>
//       {/* Plateau de jeu vert sombre Othello */}
//       <div className='grid grid-cols-8 gap-0 p-0.5 rounded-xl bg-stone-50 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] border-6 border-amber-950 ring-1 ring-amber-900/50 relative overflow-hidden'>

//         {/* On boucle sur chaque case du plateau */}
//         {currentBoard.map((cell, index) => (
// 			<MyCell key={index} cell={cell} index={index} validMoves={validMoves} onCellClick={onCellClick} />
// 		))}
//       </div>
//     </div>
//   );
// }

function MyBoard({ board, validMoves = [], onCellClick }: MyBoardProps) {
  const defaultBoard: Cell[] = Array(64).fill(null);
  defaultBoard[27] = 'WHITE';
  defaultBoard[28] = 'BLACK';
  defaultBoard[35] = 'BLACK';
  defaultBoard[36] = 'WHITE';

  const currentBoard = board || defaultBoard;

  return (
    // 3. Removed 'flex justify-center items-center' completely.
    // Just 'w-full aspect-square' forces it to strictly match the parent container's width.
    <div className='w-full aspect-square bg-[url(/wood.svg)] rounded-lg shadow-xl p-3'>

      {/* 4. Added grid-rows-8 to mathematically enforce the layout structure. */}
      <div className='w-full h-full grid grid-cols-8 grid-rows-8 gap-0 p-0.5 rounded-xl bg-stone-50 shadow-[0_20px_50px_rgba(0,0,0,0.6),inset_0_2px_8px_rgba(0,0,0,0.5)] border-6 border-amber-950 ring-1 ring-amber-900/50 overflow-hidden'>

        {currentBoard.map((cell, index) => (
          <MyCell key={index} cell={cell} index={index} validMoves={validMoves} onCellClick={onCellClick} />
        ))}

      </div>
    </div>
  );
}

export default MyBoard;