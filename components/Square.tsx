
import React from 'react';
import { Player } from '../types';

interface SquareProps {
  value: Player;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

const Square: React.FC<SquareProps> = ({ value, onClick, isWinning, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        relative w-full h-24 sm:h-32 text-4xl sm:text-6xl font-black rounded-2xl transition-all duration-300 transform
        ${!value && !disabled ? 'hover:bg-slate-700/50 hover:scale-[1.02] cursor-pointer' : 'cursor-default'}
        ${isWinning ? 'bg-indigo-600 shadow-[0_0_25px_rgba(79,70,229,0.6)] z-10' : 'bg-slate-800/40'}
        border border-slate-700/50 backdrop-blur-sm overflow-hidden
      `}
    >
      <div className="flex items-center justify-center w-full h-full">
        {value === 'X' && (
          <span className="text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] transition-all animate-in zoom-in duration-300">
            X
          </span>
        )}
        {value === 'O' && (
          <span className="text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.5)] transition-all animate-in zoom-in duration-300">
            O
          </span>
        )}
      </div>
      
      {/* Subtle grid accent */}
      {!value && !disabled && (
        <div className="absolute inset-0 opacity-0 hover:opacity-10 transition-opacity bg-gradient-to-br from-white to-transparent"></div>
      )}
    </button>
  );
};

export default Square;
