
import React from 'react';
import { Player } from '../types';

interface GameStatusProps {
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
}

const GameStatus: React.FC<GameStatusProps> = ({ xIsNext, winner }) => {
  let status;
  let colorClass;

  if (winner) {
    if (winner === 'Draw') {
      status = "It's a Stalemate!";
      colorClass = "text-slate-400";
    } else {
      status = `Victory for ${winner}!`;
      colorClass = winner === 'X' ? "text-cyan-400" : "text-rose-400";
    }
  } else {
    status = `Next Turn: ${xIsNext ? 'X' : 'O'}`;
    colorClass = xIsNext ? "text-cyan-400" : "text-rose-400";
  }

  return (
    <div className="flex flex-col items-center mb-8">
      <h2 className={`text-2xl sm:text-4xl font-extrabold tracking-tight transition-all duration-300 ${colorClass} drop-shadow-md`}>
        {status}
      </h2>
      {!winner && (
        <div className="flex gap-2 mt-4">
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${xIsNext ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-slate-700'}`}></div>
          <div className={`w-3 h-3 rounded-full transition-all duration-300 ${!xIsNext ? 'bg-rose-400 scale-125 shadow-[0_0_8px_rgba(251,113,133,0.8)]' : 'bg-slate-700'}`}></div>
        </div>
      )}
    </div>
  );
};

export default GameStatus;
