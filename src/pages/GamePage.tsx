import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { ArrowLeft, RotateCcw, Undo2, Loader2 } from 'lucide-react';
import Board from '../components/Board';
import { useState, useEffect, useCallback } from 'react';

function ResultModal() {
  const winner = useGameStore(s => s.winner);
  const restartGame = useGameStore(s => s.restartGame);
  const goHome = useNavigate();

  if (!winner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 p-10 rounded-3xl text-center animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 60px rgba(255,215,0,0.3), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="text-5xl mb-6">{winner === 'black' ? '⚫' : '⚪'}</div>
        <h2 className="text-3xl font-bold text-amber-200 mb-3">
          {winner === 'black' ? '黑方' : '白方'}获胜！
        </h2>
        <p className="text-stone-400 mb-8">精彩的对局</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={restartGame}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
          >
            再来一局
          </button>
          <button
            onClick={() => goHome('/')}
            className="px-8 py-3 rounded-xl bg-stone-700 text-stone-200 font-medium transition-all duration-300 hover:scale-105 hover:bg-stone-600 active:scale-95"
          >
            返回主页
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const navigate = useNavigate();
  const gameMode = useGameStore(s => s.gameMode);
  const currentPlayer = useGameStore(s => s.currentPlayer);
  const gameOver = useGameStore(s => s.gameOver);
  const restartGame = useGameStore(s => s.restartGame);
  const undoMove = useGameStore(s => s.undoMove);
  const isAiThinking = useGameStore(s => s.isAiThinking);
  const moveCount = useGameStore(s => s.moveHistory.length);

  const [boardSize, setBoardSize] = useState(600);

  const updateBoardSize = useCallback(() => {
    const maxSize = Math.min(window.innerWidth - 40, window.innerHeight - 200, 700);
    setBoardSize(maxSize);
  }, []);

  useEffect(() => {
    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [updateBoardSize]);

  return (
    <div className="min-h-screen flex flex-col items-center py-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950" />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `radial-gradient(circle at 30% 30%, rgba(255,215,0,0.2) 0%, transparent 50%)`,
      }} />

      {/* Header */}
      <div className="relative z-10 w-full max-w-3xl px-4 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-full ${
                currentPlayer === 'black' ? 'ring-2 ring-amber-400' : ''
              }`}
              style={{
                background: currentPlayer === 'black'
                  ? 'radial-gradient(circle at 35% 35%, #666, #000)'
                  : 'radial-gradient(circle at 35% 35%, #fff, #d0d0d0)',
              }}
            />
            <span className="text-amber-100 font-medium text-lg">
              {gameOver
                ? '游戏结束'
                : isAiThinking
                ? 'AI 思考中...'
                : `${currentPlayer === 'black' ? '黑方' : '白方'}落子`}
            </span>
            <div
              className={`w-5 h-5 rounded-full ${
                currentPlayer === 'white' ? 'ring-2 ring-amber-400' : ''
              }`}
              style={{
                background: currentPlayer === 'white'
                  ? 'radial-gradient(circle at 35% 35%, #fff, #d0d0d0)'
                  : 'radial-gradient(circle at 35% 35%, #666, #000)',
              }}
            />
          </div>

          <div className="text-stone-400 text-sm">
            第 {moveCount} 手
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="relative z-10">
        <Board size={boardSize} />
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-3 mt-6">
        <button
          onClick={undoMove}
          disabled={moveCount === 0 || gameOver || isAiThinking}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
        >
          <Undo2 className="w-4 h-4" />
          <span>悔棋</span>
        </button>

        <button
          onClick={restartGame}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>重新开始</span>
        </button>

        {isAiThinking && (
          <Loader2 className="w-5 h-5 text-amber-400 animate-spin ml-2" />
        )}
      </div>

      {/* Result Modal */}
      {gameOver && <ResultModal />}
    </div>
  );
}
