import React from "react";

const Rules = (): React.ReactElement => {
  return (
    <div className="min-h-screen bg-base-100 py-10 px-4 flex justify-center items-center">
      <div className="card w-full max-w-4xl bg-base-200/80 backdrop-blur-md border border-base-300 shadow-2xl rounded-3xl p-6 md:p-10">
        <div className="card-body p-0 flex flex-col gap-8">
          
          {/* Header */}
          <div className="text-center flex flex-col items-center gap-2">
            <span className="badge badge-neutral badge-outline text-[10px] font-bold tracking-widest uppercase py-2 px-3">
              Official Guide
            </span>
            <h1 className="text-4xl font-black text-base-content tracking-tight">
              Othello Rules
            </h1>
            <p className="text-sm text-base-content/60 max-w-md">
              Learn how to play, trap your opponent, and master the board.
            </p>
          </div>

          {/* Quick Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-base-300/60 border border-base-100 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-lg">
                8×8
              </div>
              <h3 className="font-bold text-sm text-base-content">The Grid</h3>
              <p className="text-xs text-base-content/60">
                Played on an 8x8 board with 64 double-sided discs (Black & White).
              </p>
            </div>

            <div className="card bg-base-300/60 border border-base-100 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-sm text-base-content">Players</h3>
              <p className="text-xs text-base-content/60">
                Black always moves first. Players take turns placing one disc per move.
              </p>
            </div>

            <div className="card bg-base-300/60 border border-base-100 p-5 rounded-2xl flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-full bg-neutral text-neutral-content flex items-center justify-center font-bold text-lg">
                ♔
              </div>
              <h3 className="font-bold text-sm text-base-content">Objective</h3>
              <p className="text-xs text-base-content/60">
                Have the majority of your color discs on the board when the game ends.
              </p>
            </div>
          </div>

          <div className="divider my-0">Rules Breakdown</div>

          {/* Detailed Rules Accordion */}
          <div className="flex flex-col gap-3">
            {/* Rule 1 */}
            <div className="collapse collapse-plus bg-base-300/40 border border-base-100 rounded-2xl">
              <input type="radio" name="rules-accordion" defaultChecked />
              <div className="collapse-title font-bold text-sm text-base-content">
                1. Initial Setup
              </div>
              <div className="collapse-content text-xs text-base-content/80 leading-relaxed">
                The game begins with 4 discs placed in the central four squares of the board:
                two White discs placed diagonally and two Black discs placed diagonally.
              </div>
            </div>

            {/* Rule 2 */}
            <div className="collapse collapse-plus bg-base-300/40 border border-base-100 rounded-2xl">
              <input type="radio" name="rules-accordion" />
              <div className="collapse-title font-bold text-sm text-base-content">
                2. Making a Move (Outflanking)
              </div>
              <div className="collapse-content text-xs text-base-content/80 leading-relaxed">
                You must place a disc on an empty square such that it "outflanks" one or more of your opponent's discs. 
                Outflanking means placing your disc so that it creates a continuous line (horizontally, vertically, or diagonally) bounded by your own discs at both ends.
              </div>
            </div>

            {/* Rule 3 */}
            <div className="collapse collapse-plus bg-base-300/40 border border-base-100 rounded-2xl">
              <input type="radio" name="rules-accordion" />
              <div className="collapse-title font-bold text-sm text-base-content">
                3. Flipping Discs
              </div>
              <div className="collapse-content text-xs text-base-content/80 leading-relaxed">
                All opponent discs that are outflanked in any direction during a move are turned over to match your color. 
                Multiple lines can be outflanked in a single move.
              </div>
            </div>

            {/* Rule 4 */}
            <div className="collapse collapse-plus bg-base-300/40 border border-base-100 rounded-2xl">
              <input type="radio" name="rules-accordion" />
              <div className="collapse-title font-bold text-sm text-base-content">
                4. Passing & Game Over
              </div>
              <div className="collapse-content text-xs text-base-content/80 leading-relaxed">
                If a player has no valid moves that outflank opponent discs, their turn is automatically passed. 
                The game ends when neither player can make a valid move (usually when the board is full).
              </div>
            </div>
          </div>

          {/* Strategy Tip Box */}
          <div className="alert alert-neutral bg-base-300 border-base-100 rounded-2xl p-4 flex items-start gap-3 shadow-inner">
            <span className="text-lg">💡</span>
            <div className="text-xs">
              <span className="font-extrabold text-base-content">Pro Tip: </span>
              <span className="text-base-content/70">
                Corner squares can never be flipped! Controlling corners is key to securing stable discs and winning the game.
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Rules;