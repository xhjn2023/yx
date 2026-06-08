export type CellState = 'empty' | 'black' | 'white';
export type Board = CellState[][];
export type GameMode = 'pvp' | 'pve';
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

    // forward
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
        cells.push([r, c]);
      } else break;
    }

    // backward
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

function evaluatePosition(board: Board, row: number, col: number, player: CellState): number {
  const opponent = player === 'black' ? 'white' : 'black';
  let score = 0;

  for (const [dr, dc] of DIRECTIONS) {
    let playerCount = 1;
    let opponentCount = 0;
    let openEnds = 0;

    // forward
    let blockedForward = false;
    for (let i = 1; i < 5; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        blockedForward = true;
        break;
      }
      if (board[r][c] === player) playerCount++;
      else if (board[r][c] === opponent) {
        blockedForward = true;
        break;
      } else {
        openEnds++;
        break;
      }
    }

    // backward
    let blockedBackward = false;
    for (let i = 1; i < 5; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        blockedBackward = true;
        break;
      }
      if (board[r][c] === player) playerCount++;
      else if (board[r][c] === opponent) {
        blockedBackward = true;
        break;
      } else {
        openEnds++;
        break;
      }
    }

    if (playerCount >= 5) score += 1000000;
    else if (playerCount === 4 && openEnds === 2) score += 100000;
    else if (playerCount === 4 && openEnds === 1) score += 10000;
    else if (playerCount === 3 && openEnds === 2) score += 10000;
    else if (playerCount === 3 && openEnds === 1) score += 1000;
    else if (playerCount === 2 && openEnds === 2) score += 1000;
    else if (playerCount === 2 && openEnds === 1) score += 100;
    else if (playerCount === 1 && openEnds === 2) score += 100;
  }

  return score;
}

export function getAIMove(board: Board): Position {
  let bestScore = -1;
  let bestMoves: Position[] = [];

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 'empty') continue;

      // Only consider positions near existing stones
      let hasNeighbor = false;
      for (let dr = -2; dr <= 2 && !hasNeighbor; dr++) {
        for (let dc = -2; dc <= 2 && !hasNeighbor; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] !== 'empty') {
            hasNeighbor = true;
          }
        }
      }
      if (!hasNeighbor && board.flat().some(cell => cell !== 'empty')) continue;

      // Score for AI (white)
      const attackScore = evaluatePosition(board, r, c, 'white');
      // Score for blocking player (black)
      const defenseScore = evaluatePosition(board, r, c, 'black');

      const score = attackScore + defenseScore;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [[r, c]];
      } else if (score === bestScore) {
        bestMoves.push([r, c]);
      }
    }
  }

  if (bestMoves.length === 0) {
    // First move: center
    return [7, 7];
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}
