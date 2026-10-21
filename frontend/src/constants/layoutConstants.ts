// Constants for game modes className
// used in pages: botGame, localGame, onlineGame, watchGame

// top wrapper
export const PAGE_WRAPPER_CLASSES = "w-full flex flex-col items-center gap-4 p-6 relative"

// strict 600px wrapper for Header, Board and buttons
export const BOARD_COLUMN_CLASSES = "w-full max-w-[600px] mx-auto flex flex-col items-center gap-4 shrink-0"

// homogeneous Abandonner / Terminer button for botGame, localGame, onlineGame
// w-fit mx-auto keeps it perfectly centered and sized to its text
export const ACTION_BUTTON_DANGER = "px-4 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 rounded-lg text-sm font-semibold transition-all shadow-sm w-fit mx-auto mt-2 cursor-pointer";

// homegeneous navigation button for streamBotGame, watchGame
// w-full keeps it stretched across the bottom of the column
export const ACTION_BUTTON_NEUTRAL = "px-4 py-2 bg-base-200 hover:bg-base-300 text-base-content/80 border border-base-300 rounded-lg text-sm font-semibold transition-all shadow-sm w-full mt-2 cursor-pointer";