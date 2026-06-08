import { create } from 'zustand';
import {
  Board,
  CellState,
  GameMode,
  Position,
  BOARD_SIZE,
  createEmptyBoard,
  checkWin,
  getAIMove,
} from '../utils/gameEngine';

interface GameState {
  board: Board;
  currentPlayer: 'black' | 'white';
  gameMode: GameMode;
  gameOver: boolean;
  winner: 'black' | 'white' | null;
  winningCells: Position[];
  moveHistory: Position[];
  isAiThinking: boolean;
}

interface GameActions {
  initGame: (mode: GameMode) => void;
  makeMove: (row: number, col: number) => void;
  undoMove: () => void;
  restartGame: () => void;
}

type GameStore = GameState & GameActions;

const useGameStore = create<GameStore>((set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: 'black',
  gameMode: 'pvp',
  gameOver: false,
  winner: null,
  winningCells: [],
  moveHistory: [],
  isAiThinking: false,

  initGame: (mode: GameMode) => {
    set({
      board: createEmptyBoard(),
      currentPlayer: 'black',
      gameMode: mode,
      gameOver: false,
      winner: null,
      winningCells: [],
      moveHistory: [],
      isAiThinking: false,
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

    const nextPlayer = state.currentPlayer === 'black' ? 'white' : 'black';

    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      gameOver,
      winner,
      winningCells: winningCells || [],
      moveHistory: [...state.moveHistory, [row, col]],
      isAiThinking: false,
    });

    // If PVE mode and game not over, trigger AI move
    if (!gameOver && state.gameMode === 'pve' && nextPlayer === 'white') {
      set({ isAiThinking: true });
      setTimeout(() => {
        const aiMove = getAIMove(get().board);
        get().makeMove(aiMove[0], aiMove[1]);
      }, 500);
    }
  },

  undoMove: () => {
    const state = get();
    const stepsBack = state.gameMode === 'pve' ? 2 : 1;
    if (state.moveHistory.length < stepsBack || state.gameOver) return;

    const newBoard = createEmptyBoard();
    const newHistory = state.moveHistory.slice(0, -stepsBack);

    // Replay all moves
    let player: 'black' | 'white' = 'black';
    for (const [r, c] of newHistory) {
      newBoard[r][c] = player;
      player = player === 'black' ? 'white' : 'black';
    }

    set({
      board: newBoard,
      currentPlayer: player,
      moveHistory: newHistory,
    });
  },

  restartGame: () => {
    const state = get();
    set({
      board: createEmptyBoard(),
      currentPlayer: 'black',
      gameOver: false,
      winner: null,
      winningCells: [],
      moveHistory: [],
      isAiThinking: false,
    });
  },
}));

export { useGameStore };
