import { useMemo } from 'react';
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
    const lines = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = gridOffset + i * gridSpacing;
      // horizontal
      lines.push(
        <line
          key={`h${i}`}
          x1={gridOffset}
          y1={pos}
          x2={gridOffset + gridSize}
          y2={pos}
          stroke="#8B7355"
          strokeWidth={1}
          strokeOpacity={0.8}
        />
      );
      // vertical
      lines.push(
        <line
          key={`v${i}`}
          x1={pos}
          y1={gridOffset}
          x2={pos}
          y2={gridOffset + gridSize}
          stroke="#8B7355"
          strokeWidth={1}
          strokeOpacity={0.8}
        />
      );
    }
    // Star points
    const starPoints = [[3, 3], [3, 7], [3, 11], [7, 3], [7, 7], [7, 11], [11, 3], [11, 7], [11, 11]];
    for (const [r, c] of starPoints) {
      lines.push(
        <circle
          key={`s${r}${c}`}
          cx={gridOffset + c * gridSpacing}
          cy={gridOffset + r * gridSpacing}
          r={3}
          fill="#8B7355"
          fillOpacity={0.8}
        />
      );
    }
    return lines;
  }, [gridOffset, gridSize, gridSpacing]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameOver) {
      makeMove(row, col);
    }
  };

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

      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 rounded-lg opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 2px,
            rgba(139,115,85,0.3) 2px,
            rgba(139,115,85,0.3) 4px
          )`,
        }}
      />

      {/* Grid SVG */}
      <svg
        className="absolute inset-0"
        width={size}
        height={size}
      >
        {gridLines}
      </svg>

      {/* Column labels */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => (
        <div
          key={`col-${i}`}
          className="absolute text-amber-900/60 font-mono text-xs select-none"
          style={{
            left: gridOffset + i * gridSpacing - 6,
            top: gridOffset + gridSize + 4,
          }}
        >
          {COL_LABELS[i]}
        </div>
      ))}

      {/* Row labels */}
      {Array.from({ length: BOARD_SIZE }, (_, i) => (
        <div
          key={`row-${i}`}
          className="absolute text-amber-900/60 font-mono text-xs select-none"
          style={{
            left: gridOffset + gridSize + 6,
            top: gridOffset + i * gridSpacing - 7,
          }}
        >
          {BOARD_SIZE - i}
        </div>
      ))}

      {/* Interactive cells */}
      {Array.from({ length: BOARD_SIZE }, (_, row) =>
        Array.from({ length: BOARD_SIZE }, (_, col) => (
          <div
            key={`cell-${row}-${col}`}
            className="absolute z-0 cursor-pointer hover:z-5"
            style={{
              left: gridOffset + col * gridSpacing - gridSpacing / 2,
              top: gridOffset + row * gridSpacing - gridSpacing / 2,
              width: gridSpacing,
              height: gridSpacing,
            }}
            onClick={() => handleCellClick(row, col)}
          >
            {/* Hover indicator */}
            {!board[row][col] && !gameOver && (
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
            )}
          </div>
        ))
      )}

      {/* Stones */}
      {board.map((row, rowIdx) =>
        row.map((cell, colIdx) => {
          if (cell === 'empty') return null;
          const isLast = lastMove && lastMove[0] === rowIdx && lastMove[1] === colIdx;
          const isWinning = winningSet.has(`${rowIdx},${colIdx}`);
          return (
            <Stone
              key={`${rowIdx}-${colIdx}`}
              row={rowIdx}
              col={colIdx}
              color={cell}
              isLast={!!isLast}
              isWinning={isWinning}
              onClick={() => handleCellClick(rowIdx, colIdx)}
              size={size}
            />
          );
        })
      )}
    </div>
  );
}
