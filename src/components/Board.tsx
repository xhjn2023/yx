import { useMemo, useCallback } from 'react';
import { useGameStore } from '../stores/gameStore';
import { BOARD_SIZE } from '../utils/gameEngine';
import Stone from './Stone';

interface BoardProps {
  size: number;
}

const COL_LABELS = 'ABCDEFGHIJKLMNO';

export default function Board({ size }: BoardProps) {
  const board = useGameStore(s => s.board);
  const moveHistory = useGameStore(s => s.moveHistory);
  const winningCells = useGameStore(s => s.winningCells);
  const gameOver = useGameStore(s => s.gameOver);
  const makeMove = useGameStore(s => s.makeMove);

  const cellSize = size / BOARD_SIZE;
  const gridOffset = cellSize / 2;
  const gridSize = size - cellSize;
  const gridSpacing = gridSize / (BOARD_SIZE - 1);

  const lastMove = moveHistory.length > 0 ? moveHistory[moveHistory.length - 1] : null;

  const winningSet = useMemo(() => {
    const set = new Set<string>();
    for (const [r, c] of winningCells) {
      set.add(`${r},${c}`);
    }
    return set;
  }, [winningCells]);

  const gridLines = useMemo(() => {
    const lines: JSX.Element[] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = gridOffset + i * gridSpacing;
      lines.push(
        <line key={`h${i}`} x1={gridOffset} y1={pos} x2={gridOffset + gridSize} y2={pos} stroke="#8B7355" strokeWidth={1} strokeOpacity={0.8} />
      );
      lines.push(
        <line key={`v${i}`} x1={pos} y1={gridOffset} x2={pos} y2={gridOffset + gridSize} stroke="#8B7355" strokeWidth={1} strokeOpacity={0.8} />
      );
    }
    const starPoints: [number, number][] = [[3,3],[3,7],[3,11],[7,3],[7,7],[7,11],[11,3],[11,7],[11,11]];
    for (const [r, c] of starPoints) {
      lines.push(
        <circle key={`s${r}${c}`} cx={gridOffset + c * gridSpacing} cy={gridOffset + r * gridSpacing} r={3} fill="#8B7355" fillOpacity={0.8} />
      );
    }
    return lines;
  }, [gridOffset, gridSize, gridSpacing]);

  const handleCellClick = useCallback((row: number, col: number) => {
    if (!gameOver && board[row][col] === 'empty') {
      makeMove(row, col);
    }
  }, [gameOver, board, makeMove]);

  // Render stones
  const stones = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = board[r][c];
        if (cell === 'empty') continue;
        const isLast = lastMove !== null && lastMove[0] === r && lastMove[1] === c;
        const isWinning = winningSet.has(`${r},${c}`);
        const isNew = isLast && !isWinning;
        elements.push(
          <div
            key={`${r}-${c}`}
            style={{
              position: 'absolute',
              left: gridOffset + c * gridSpacing - gridSpacing / 2,
              top: gridOffset + r * gridSpacing - gridSpacing / 2,
              width: gridSpacing,
              height: gridSpacing,
            }}
          >
            <Stone
              color={cell}
              isLast={isLast}
              isWinning={isWinning}
              onClick={() => handleCellClick(r, c)}
              size={size}
              isNew={isNew}
            />
          </div>
        );
      }
    }
    return elements;
  }, [board, lastMove, winningSet, gridOffset, gridSpacing, handleCellClick, size]);

  // Render empty cells for interaction
  const emptyCells = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] !== 'empty' || gameOver) continue;
        elements.push(
          <div
            key={`cell-${r}-${c}`}
            className="cursor-pointer"
            style={{
              position: 'absolute',
              left: gridOffset + c * gridSpacing - gridSpacing / 2,
              top: gridOffset + r * gridSpacing - gridSpacing / 2,
              width: gridSpacing,
              height: gridSpacing,
              zIndex: 5,
            }}
            onClick={() => handleCellClick(r, c)}
          >
            <div
              className="absolute rounded-full opacity-0 hover:opacity-30 transition-opacity"
              style={{
                width: gridSpacing * 0.8,
                height: gridSpacing * 0.8,
                left: '10%',
                top: '10%',
                backgroundColor: '#000',
              }}
            />
          </div>
        );
      }
    }
    return elements;
  }, [board, gameOver, gridOffset, gridSpacing, handleCellClick]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Board background */}
      <div
        className="absolute inset-0 rounded-lg shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, #DEB887 0%, #D2A56E 25%, #C99862 50%, #D4AA76 75%, #DEB887 100%)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}
      />
      {/* Wood grain texture */}
      <div
        className="absolute inset-0 rounded-lg opacity-10 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(139,115,85,0.3) 2px, rgba(139,115,85,0.3) 4px)`,
        }}
      />
      {/* Grid */}
      <svg className="absolute inset-0 pointer-events-none" width={size} height={size}>{gridLines}</svg>
      {/* Labels */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => (
        <>
          <div key={`col-${i}`} className="absolute text-amber-900/60 font-mono text-xs select-none pointer-events-none" style={{ left: gridOffset + i * gridSpacing - 6, top: gridOffset + gridSize + 4 }}>{COL_LABELS[i]}</div>
          <div key={`row-${i}`} className="absolute text-amber-900/60 font-mono text-xs select-none pointer-events-none" style={{ left: gridOffset + gridSize + 6, top: gridOffset + i * gridSpacing - 7 }}>{BOARD_SIZE - i}</div>
        </>
      ))}
      {emptyCells}
      {stones}
    </div>
  );
}
