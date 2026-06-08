import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { ArrowLeft, RotateCcw, Undo2, Loader2, HelpCircle, Timer } from 'lucide-react';
import Board from '../components/Board';
import GameRules from '../components/GameRules';
import { useState, useEffect, useCallback, useRef } from 'react';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ResultModal() {
  const winner = useGameStore(s => s.winner);
  const isDraw = useGameStore(s => s.isDraw);
  const restartGame = useGameStore(s => s.restartGame);
  const goHome = useNavigate();

  if (!winner && !isDraw) return null;

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
        <div className="text-5xl mb-4">
          {isDraw ? '🤝' : winner === 'black' ? '⚫' : '⚪'}
        </div>
        <h2 className="text-3xl font-bold text-amber-200 mb-2">
          {isDraw ? '平局！' : `${winner === 'black' ? '黑方' : '白方'}获胜！`}
        </h2>
        <p className="text-stone-400 mb-8">
          {isDraw ? '势均力敌的对局' : '精彩的对局'}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={restartGame}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
          >
            再来一局
          </button>
          <button
            onClick={() => { goHome('/'); restartGame(); }}
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
  const difficulty = useGameStore(s => s.difficulty);
  const currentPlayer = useGameStore(s => s.currentPlayer);
  const gameOver = useGameStore(s => s.gameOver);
  const isDraw = useGameStore(s => s.isDraw);
  const restartGame = useGameStore(s => s.restartGame);
  const undoMove = useGameStore(s => s.undoMove);
  const isAiThinking = useGameStore(s => s.isAiThinking);
  const moveCount = useGameStore(s => s.moveHistory.length);
  const blackTime = useGameStore(s => s.blackTime);
  const whiteTime = useGameStore(s => s.whiteTime);
  const score = useGameStore(s => s.score);

  const [boardSize, setBoardSize] = useState(600);
  const [showRules, setShowRules] = useState(false);

  const updateBoardSize = useCallback(() => {
    const maxSize = Math.min(window.innerWidth - 32, window.innerHeight - 220, 700);
    setBoardSize(Math.max(300, maxSize));
  }, []);

  useEffect(() => {
    updateBoardSize();
    window.addEventListener('resize', updateBoardSize);
    return () => window.removeEventListener('resize', updateBoardSize);
  }, [updateBoardSize]);

  const difficultyLabel = difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难';
  const difficultyColor = difficulty === 'easy' ? 'text-green-400' : difficulty === 'medium' ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="min-h-screen flex flex-col items-center py-4 relative overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950" />

      {/* Header */}
      <div className="relative z-10 w-full max-w-3xl px-4 mb-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { navigate('/'); restartGame(); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white text-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>返回</span>
          </button>

          {/* Player info + Timer */}
          <div className="flex items-center gap-4">
            {/* Black player */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              currentPlayer === 'black' && !gameOver ? 'bg-amber-600/20 border border-amber-400/30' : ''
            }`}>
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: 'radial-gradient(circle at 35% 35%, #666, #000)' }}
              />
              <span className="text-amber-100 text-sm font-medium">
                黑方 {currentPlayer === 'black' && !gameOver ? '(思考中)' : ''}
              </span>
              <Timer className="w-3 h-3 text-stone-400" />
              <span className="text-stone-300 text-xs font-mono">{formatTime(blackTime)}</span>
            </div>

            {/* White player */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${
              currentPlayer === 'white' && !gameOver ? 'bg-amber-600/20 border border-amber-400/30' : ''
            }`}>
              <div
                className="w-4 h-4 rounded-full"
                style={{ background: 'radial-gradient(circle at 35% 35%, #fff, #d0d0d0)' }}
              />
              <span className="text-amber-100 text-sm font-medium">
                白方 {isAiThinking ? '(AI思考中)' : currentPlayer === 'white' && !gameOver ? '(思考中)' : ''}
              </span>
              <Timer className="w-3 h-3 text-stone-400" />
              <span className="text-stone-300 text-xs font-mono">{formatTime(whiteTime)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-stone-400 text-xs">第 {moveCount} 手</span>
            <button
              onClick={() => setShowRules(true)}
              className="p-1.5 rounded-lg bg-stone-800/60 border border-stone-600/30 text-stone-300 hover:text-amber-300 transition-colors"
              aria-label="查看规则"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mode and difficulty info */}
        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-stone-500">
          <span>{gameMode === 'pvp' ? '双人对战' : '人机对战'}</span>
          {gameMode === 'pve' && <span className={difficultyColor}>难度: {difficultyLabel}</span>}
          <span>黑 {score.blackWins} : {score.whiteWins} 白</span>
        </div>
      </div>

      {/* Board */}
      <div className="relative z-10">
        <Board size={boardSize} />
      </div>

      {/* Controls */}
      <div className="relative z-10 flex items-center gap-3 mt-4">
        <button
          onClick={undoMove}
          disabled={moveCount === 0 || gameOver || isAiThinking}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-sm"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span>悔棋</span>
        </button>

        <button
          onClick={restartGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-800/60 border border-stone-600/30 text-stone-300 transition-all duration-200 hover:bg-stone-700/60 hover:text-white active:scale-95 text-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新开始</span>
        </button>

        {isAiThinking && (
          <Loader2 className="w-4 h-4 text-amber-400 animate-spin ml-1" />
        )}
      </div>

      {/* Result Modal */}
      {(gameOver || isDraw) && <ResultModal />}

      {/* Rules Modal */}
      {showRules && <GameRules onClose={() => setShowRules(false)} />}
    </div>
  );
}
