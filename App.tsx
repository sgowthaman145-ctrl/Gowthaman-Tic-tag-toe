
import React, { useState, useEffect, useCallback } from 'react';
import Square from './components/Square';
import GameStatus from './components/GameStatus';
import { Player, GameMode } from './types';
import { getGameCommentary, getProTip } from './services/geminiService';

const calculateWinner = (squares: Player[]): { winner: Player | 'Draw' | null; line: number[] | null } => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6],           // Diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  if (squares.every(s => s !== null)) {
    return { winner: 'Draw', line: null };
  }
  return { winner: null, line: null };
};

const App: React.FC = () => {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState<boolean>(true);
  const [mode, setMode] = useState<GameMode>(GameMode.PVP);
  const [commentary, setCommentary] = useState<string>("Welcome to Zenith. Make your first move.");
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [proTip, setProTip] = useState<string>("");

  const { winner, line: winningLine } = calculateWinner(board);

  const handleSquareClick = useCallback(async (i: number) => {
    if (board[i] || winner || isAiThinking) return;

    const newBoard = [...board];
    newBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(newBoard);
    setXIsNext(!xIsNext);
    setProTip("");

    // Get Gemini Commentary for the move
    const result = calculateWinner(newBoard);
    const comm = await getGameCommentary(newBoard, xIsNext ? 'X' : 'O', result.winner === 'Draw' ? 'Nobody' : result.winner);
    setCommentary(comm);
  }, [board, winner, xIsNext, isAiThinking]);

  // AI Logic for PVC
  useEffect(() => {
    if (!xIsNext && (mode === GameMode.PVC_EASY || mode === GameMode.PVC_HARD) && !winner) {
      const timer = setTimeout(async () => {
        setIsAiThinking(true);
        const availableMoves = board.map((val, idx) => (val === null ? idx : null)).filter(val => val !== null) as number[];
        
        if (availableMoves.length > 0) {
          let move: number;
          if (mode === GameMode.PVC_HARD) {
            // Simple heuristic for "hard": prioritize center, then corners, then random
            if (board[4] === null) {
              move = 4;
            } else {
              const corners = [0, 2, 6, 8].filter(c => board[c] === null);
              if (corners.length > 0) {
                move = corners[Math.floor(Math.random() * corners.length)];
              } else {
                move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
              }
            }
          } else {
            // Easy: Just random
            move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
          }

          const newBoard = [...board];
          newBoard[move] = 'O';
          setBoard(newBoard);
          setXIsNext(true);
          
          const result = calculateWinner(newBoard);
          const comm = await getGameCommentary(newBoard, 'O', result.winner === 'Draw' ? 'Nobody' : result.winner);
          setCommentary(comm);
        }
        setIsAiThinking(false);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [xIsNext, mode, board, winner]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setCommentary("Game restarted. Good luck.");
    setProTip("");
  };

  const fetchProTip = async () => {
    setProTip("Analyzing...");
    const tip = await getProTip(board, xIsNext ? 'X' : 'O');
    setProTip(tip);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-indigo-400 to-rose-400 bg-clip-text text-transparent mb-2 tracking-tighter">
          ZENITH XO
        </h1>
        <p className="text-slate-400 font-medium">Elevated Tic-Tac-Toe Experience</p>
      </div>

      {/* Main Game Container */}
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Commentary Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 min-h-[80px] flex items-center justify-center text-center shadow-xl backdrop-blur-md">
          <p className="italic text-slate-300 leading-relaxed font-light">
            <i className="fa-solid fa-robot mr-2 text-indigo-400"></i>
            "{commentary}"
          </p>
        </div>

        {/* Board */}
        <div className="relative">
          <GameStatus xIsNext={xIsNext} winner={winner} />
          
          <div className="grid grid-cols-3 gap-3">
            {board.map((square, i) => (
              <Square
                key={i}
                value={square}
                onClick={() => handleSquareClick(i)}
                isWinning={winningLine?.includes(i) || false}
                disabled={!!winner || isAiThinking}
              />
            ))}
          </div>

          {isAiThinking && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20 backdrop-blur-[1px] pointer-events-none rounded-2xl">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: GameMode.PVP, label: 'PvP', icon: 'fa-user-group' },
              { id: GameMode.PVC_EASY, label: 'Easy AI', icon: 'fa-brain' },
              { id: GameMode.PVC_HARD, label: 'Hard AI', icon: 'fa-microchip' }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => { setMode(m.id as GameMode); resetGame(); }}
                className={`flex flex-col items-center justify-center py-3 rounded-xl border transition-all duration-200 ${
                  mode === m.id 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' 
                    : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid ${m.icon} mb-1`}></i>
                <span className="text-xs font-bold uppercase tracking-wider">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetGame}
              className="flex-1 bg-slate-100 hover:bg-white text-slate-900 font-bold py-4 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-rotate-right"></i>
              RESTART GAME
            </button>
            
            <button
              onClick={fetchProTip}
              disabled={!!winner || isAiThinking}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 rounded-2xl shadow-xl transition-all disabled:opacity-50 flex items-center justify-center"
              title="Get Pro Tip from Gemini"
            >
              <i className="fa-solid fa-lightbulb"></i>
            </button>
          </div>

          {proTip && (
            <div className="p-4 bg-indigo-950/30 border border-indigo-900/50 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-sm font-medium text-indigo-300 text-center">
                <span className="font-bold text-indigo-400 uppercase tracking-tighter mr-2">Pro Tip:</span>
                {proTip}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer / Info */}
      <footer className="mt-12 text-slate-500 text-xs flex flex-col items-center gap-2">
        <div className="flex gap-4">
          <span><i className="fa-solid fa-check text-green-500 mr-1"></i> Gemini 3 Enabled</span>
          <span><i className="fa-solid fa-check text-green-500 mr-1"></i> React 18+</span>
          <span><i className="fa-solid fa-check text-green-500 mr-1"></i> Mobile Ready</span>
        </div>
        <p>&copy; 2024 Zenith Gaming Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
