export type CellState = 'empty' | 'black' | 'white';
export type Board = CellState[][];
export type GameMode = 'pvp' | 'pve';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Position = [number, number];

export const BOARD_SIZE = 15;

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 'empty' as CellState)
  );
}

const DIRECTIONS: [number, number][] = [
  [0, 1],   // horizontal
  [1, 0],   // vertical
  [1, 1],   // diagonal
  [1, -1],  // anti-diagonal
];

export function checkWin(board: Board, row: number, col: number): Position[] | null {
  const player = board[row][col];
  if (player === 'empty') return null;

  for (const [dr, dc] of DIRECTIONS) {
    const cells: Position[] = [[row, col]];

    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }

    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }

    if (cells.length >= 5) return cells;
  }

  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every(row => row.every(cell => cell !== 'empty'));
}

function evaluateLine(
  board: Board, row: number, col: number, dr: number, dc: number, player: CellState
): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let count = 1;
  let openEnds = 0;

  // forward
  let blocked = false;
  for (let i = 1; i < 5; i++) {
    const r = row + dr * i;
    const c = col + dc * i;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked = true; break; }
    if (board[r][c] === player) count++;
    else if (board[r][c] === opponent) { blocked = true; break; }
    else { openEnds++; break; }
  }

  // backward
  for (let i = 1; i < 5; i++) {
    const r = row - dr * i;
    const c = col - dc * i;
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) { blocked = true; break; }
    if (board[r][c] === player) count++;
    else if (board[r][c] === opponent) { blocked = true; break; }
    else { openEnds++; break; }
  }

  if (count >= 5) return 1000000;
  if (count === 4 && openEnds === 2) return 500000;
  if (count === 4 && openEnds === 1) return 50000;
  if (count === 3 && openEnds === 2) return 20000;
  if (count === 3 && openEnds === 1) return 2000;
  if (count === 2 && openEnds === 2) return 1000;
  if (count === 2 && openEnds === 1) return 100;
  if (count === 1 && openEnds === 2) return 50;
  return 0;
}

function evaluatePosition(board: Board, row: number, col: number, player: CellState): number {
  let score = 0;
  for (const [dr, dc] of DIRECTIONS) {
    score += evaluateLine(board, row, col, dr, dc, player);
  }
  return score;
}

// Check if position is near existing stones (optimization)
function hasNeighbor(board: Board, row: number, col: number, range: number = 2): boolean {
  for (let dr = -range; dr <= range; dr++) {
    for (let dc = -range; dc <= range; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = row + dr;
      const nc = col + dc;
      if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== 'empty') {
        return true;
      }
    }
  }
  return false;
}

// Get candidate positions (near existing stones)
function getCandidates(board: Board, range: number = 2): Position[] {
  const candidates: Position[] = [];
  const seen = new Set<string>();

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 'empty') {
        for (let dr = -range; dr <= range; dr++) {
          for (let dc = -range; dc <= range; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 'empty') {
              const key = `${nr},${nc}`;
              if (!seen.has(key)) {
                seen.add(key);
                candidates.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }

  if (candidates.length === 0) return [[7, 7]]; // center if empty board
  return candidates;
}

interface AIMoveConfig {
  depth: number;       // search depth (0 = no lookahead)
  randomness: number;  // probability of making random moves (0-1)
  candidateRange: number; // neighbor search range
}

const DIFFICULTY_CONFIG: Record<Difficulty, AIMoveConfig> = {
  easy:   { depth: 0, randomness: 0.4, candidateRange: 1 },
  medium: { depth: 0, randomness: 0.1, candidateRange: 2 },
  hard:   { depth: 0, randomness: 0,   candidateRange: 2 },
};

function evaluateBoard(board: Board, position: Position, aiPlayer: CellState): number {
  const [r, c] = position;
  const attackScore = evaluatePosition(board, r, c, aiPlayer);
  const defenseScore = evaluatePosition(board, r, c, aiPlayer === 'black' ? 'white' : 'black');
  // Add position bias (prefer center)
  const centerBias = (BOARD_SIZE - 1) / 2;
  const posScore = Math.max(0, 10 - (Math.abs(r - centerBias) + Math.abs(c - centerBias)));
  return attackScore * 1.1 + defenseScore + posScore;
}

export function getAIMove(board: Board, difficulty: Difficulty = 'medium'): Position {
  const config = DIFFICULTY_CONFIG[difficulty];
  const aiPlayer = 'white';

  // Random move for easy mode
  if (Math.random() < config.randomness) {
    const candidates = getCandidates(board, config.candidateRange);
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  const candidates = getCandidates(board, config.candidateRange);

  let bestScore = -1;
  let bestMoves: Position[] = [];

  for (const [r, c] of candidates) {
    const score = evaluateBoard(board, [r, c], aiPlayer);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [[r, c]];
    } else if (score === bestScore) {
      bestMoves.push([r, c]);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
