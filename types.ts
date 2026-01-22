
export type Player = 'X' | 'O' | null;

export interface GameState {
  board: Player[];
  xIsNext: boolean;
  winner: Player | 'Draw' | null;
  winningLine: number[] | null;
  history: Player[][];
  stepNumber: number;
}

export interface MoveAnalysis {
  commentary: string;
  intensity: 'chill' | 'aggressive' | 'insightful';
}

export enum GameMode {
  PVP = 'PVP',
  PVC_EASY = 'PVC_EASY',
  PVC_HARD = 'PVC_HARD'
}
