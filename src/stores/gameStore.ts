import { create } from 'zustand';
import {
  Board,
  CellState,
  GameMode,
  Difficulty,
  Position,
  createEmptyBoard,
  checkWin,
  isBoardFull,
  getAIMove,
} from '../utils/gameEngine';

export interface ScoreRecord {
  blackWins: number;
  whiteWins: number;
  draws: number;
}

interface GameState {
  board: Board;
  currentPlayer: 'black' | 'white';
  gameMode: GameMode;
  difficulty: Difficulty;
  gameOver: boolean;
  isDraw: boolean;
  winner: 'black' | 'white' | null;
  winningCells: Position[];
  moveHistory: Position[];
  isAiThinking: boolean;
  // Timer
  blackTime: number;
  whiteTime: number;
  timerRunning: boolean;
  // Score
  score: ScoreRecord;
}

interface GameActions {
  initGame: (mode: GameMode, difficulty?: Difficulty) => void;
  makeMove: (row: number, col: number) => void;
  undoMove: () => void;
  restartGame: () => void;
  setDifficulty: (difficulty: Difficulty) => void;
  toggleTimer: (running: boolean) => void;
  updateScore: (winner: 'black' | 'white' | null) => void;
}

type GameStore = GameState & GameActions;

let timerInterval: number | null = null;

const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  gameMode: 'pvp',
  difficulty: 'medium',
  gameOver: false,
  isDraw: false,
  winner: null,
  winningCells: [],
  moveHistory: [],
  isAiThinking: false,
  blackTime: 0,
  whiteTime: 0,
  timerRunning: false,
  score: { blackWins: 0, whiteWins: 0, draws: 0 },

  initGame: (mode: GameMode, difficulty: Difficulty = 'medium') => {
    // Clear existing timer
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    set({
      board: createEmptyBoard(),
      currentPlayer: 'black',
      gameMode: mode,
      difficulty,
      gameOver: false,
      isDraw: false,
      winner: null,
      winningCells: [],
      moveHistory: [],
      isAiThinking: false,
      blackTime: 0,
      whiteTime: 0,
      timerRunning: false,
    });
  },

  makeMove: (row: number, col: number) => {
    const state = get();
    if (state.gameOver || state.board[row][col] !== 'empty' || state.isAiThinking) return;

    const newBoard = state.board.map(r => [...r]);
    newBoard[row][col] = state.currentPlayer;

    const winningCells = checkWin(newBoard, row, col);
    const gameOver = !!winningCells;
    const winner = gameOver ? state.currentPlayer : null;
    const draw = !gameOver && isBoardFull(newBoard);

    const nextPlayer = state.currentPlayer === 'black' ? 'white' : 'black';

    // Update timer
    const currentKey = state.currentPlayer === 'black' ? 'blackTime' : 'whiteTime';

    // Start timer for next player if game continues
    if (!gameOver && !draw && !state.timerRunning) {
      const startTimer = () => {
        if (timerInterval) clearInterval(timerInterval);
        timerInterval = window.setInterval(() => {
          const s = get();
          if (!s.timerRunning || s.gameOver) {
            if (timerInterval) {
              clearInterval(timerInterval);
              timerInterval = null;
            }
            return;
          }
          const key = s.currentPlayer === 'black' ? 'blackTime' : 'whiteTime';
          set({ [key]: (s as any)[key] + 1 } as Partial<GameState>);
        }, 1000);
      };
      startTimer();
    }

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      gameOver,
      isDraw: draw,
      winner,
      winningCells: winningCells || [],
      moveHistory: [...state.moveHistory, [row, col]],
      isAiThinking: false,
      timerRunning: !gameOver && !draw,
      [currentKey]: (state as any)[currentKey] + 1,
    } as Partial<GameState> as any);

    // Update score
    if (gameOver || draw) {
      const finalWinner = draw ? null : winner;
      get().updateScore(finalWinner);
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      return;
    }

    // If PVE mode and game not over, trigger AI move
    if (state.gameMode === 'pve' && nextPlayer === 'white') {
      set({ isAiThinking: true });
      const delay = 300 + Math.random() * 400;
      setTimeout(() => {
        const aiMove = getAIMove(get().board, get().difficulty);
        get().makeMove(aiMove[0], aiMove[1]);
      }, delay);
    }
  },

  undoMove: () => {
    const state = get();
    const stepsBack = state.gameMode === 'pve' ? 2 : 1;
    if (state.moveHistory.length < stepsBack || state.gameOver) return;

    const newBoard = createEmptyBoard();
    const newHistory = state.moveHistory.slice(0, -stepsBack);

    let player: 'black' | 'white' = 'black';
    let blackTime = 0;
    let whiteTime = 0;
    for (const [r, c] of newHistory) {
      newBoard[r][c] = player;
      if (player === 'black') blackTime += 1;
      else whiteTime += 1;
      player = player === 'black' ? 'white' : 'black';
    }

    set({
      board: newBoard,
      currentPlayer: player,
      moveHistory: newHistory,
      blackTime,
      whiteTime,
    });
  },

  restartGame: () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }

    const state = get();
    set({
      board: createEmptyBoard(),
      currentPlayer: 'black',
      gameOver: false,
      isDraw: false,
      winner: null,
      winningCells: [],
      moveHistory: [],
      isAiThinking: false,
      blackTime: 0,
      whiteTime: 0,
      timerRunning: false,
      gameMode: state.gameMode,
      difficulty: state.difficulty,
    });
  },

  setDifficulty: (difficulty: Difficulty) => {
    set({ difficulty });
  },

  toggleTimer: (running: boolean) => {
    set({ timerRunning: running });
    if (!running && timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  },

  updateScore: (winner: 'black' | 'white' | null) => {
    const state = get();
    const newScore = { ...state.score };
    if (winner === 'black') newScore.blackWins++;
    else if (winner === 'white') newScore.whiteWins++;
    else newScore.draws++;
    set({ score: newScore });
  },
}));

export { useGameStore };
