import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { Swords, Bot, HelpCircle } from 'lucide-react';
import GameRules from '../components/GameRules';
import type { Difficulty } from '../utils/gameEngine';

export default function Home() {
  const navigate = useNavigate();
  const initGame = useGameStore(s => s.initGame);
  const score = useGameStore(s => s.score);

  const [selectedMode, setSelectedMode] = useState<'pvp' | 'pve' | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [showRules, setShowRules] = useState(false);

  const handleStartGame = useCallback((mode: 'pvp' | 'pve') => {
    initGame(mode, mode === 'pve' ? selectedDifficulty : undefined);
    navigate('/game');
  }, [initGame, navigate, selectedDifficulty]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden select-none">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-yellow-900 to-stone-900" />
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,215,0,0.15) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 40%),
                          radial-gradient(circle at 40% 80%, rgba(217,169,101,0.2) 0%, transparent 45%)`,
      }} />

      {/* Floating decorative elements */}
      <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-gradient-to-br from-amber-400/10 to-transparent blur-2xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-gradient-to-br from-yellow-300/10 to-transparent blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Help button */}
      <button
        onClick={() => setShowRules(true)}
        className="absolute top-6 right-6 z-20 p-3 rounded-xl bg-stone-800/40 border border-stone-600/20 text-stone-300 hover:bg-stone-700/60 hover:text-amber-300 transition-all duration-200"
        aria-label="查看游戏规则"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Main content */}
      <div className="relative z-10 text-center px-8 animate-fade-in max-w-2xl w-full">
        {/* Title */}
        <div className="mb-12">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 mb-4 tracking-wider">
            五子棋
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400/60" />
            <p className="text-amber-200/70 text-lg tracking-widest font-light">GOMOKU</p>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Score */}
        {(score.blackWins + score.whiteWins + score.draws) > 0 && (
          <div className="mb-8 flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-500 to-black" />
              <span className="text-amber-200/80">黑方: {score.blackWins}</span>
            </div>
            <div className="text-stone-500">平局: {score.draws}</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-white to-gray-300" />
              <span className="text-amber-200/80">白方: {score.whiteWins}</span>
            </div>
          </div>
        )}

        {/* Mode selection */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={() => { setSelectedMode('pvp'); handleStartGame('pvp'); }}
            className={`group relative px-8 py-4 rounded-2xl transition-all duration-300 active:scale-95 ${
              selectedMode === 'pvp'
                ? 'bg-gradient-to-br from-amber-700/80 to-amber-800/80 border-amber-400/50 scale-105 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                : 'bg-gradient-to-br from-amber-800/60 to-amber-900/80 border-amber-600/30 hover:scale-105 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)]'
            } border backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <Swords className="w-5 h-5 text-amber-300" />
              <span className="text-lg text-amber-100 font-medium group-hover:text-white">
                双人对战
              </span>
            </div>
          </button>

          <button
            onClick={() => setSelectedMode(selectedMode === 'pve' ? null : 'pve')}
            className={`group relative px-8 py-4 rounded-2xl transition-all duration-300 ${
              selectedMode === 'pve'
                ? 'bg-gradient-to-br from-stone-600/80 to-stone-700/80 border-stone-400/50 scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)]'
                : 'bg-gradient-to-br from-stone-700/60 to-stone-800/80 border-stone-500/30 hover:scale-105 hover:border-stone-400/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]'
            } border backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-stone-300" />
              <span className="text-lg text-stone-100 font-medium group-hover:text-white">
                人机对战
              </span>
            </div>
          </button>
        </div>

        {/* Difficulty selection (only for PVE) */}
        {selectedMode === 'pve' && (
          <div className="mb-6 animate-fade-in">
            <p className="text-amber-200/60 text-sm mb-3">选择难度</p>
            <div className="flex justify-center gap-3">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDifficulty(d)}
                  className={`px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95 ${
                    selectedDifficulty === d
                      ? d === 'easy'
                        ? 'bg-green-600/80 text-green-100 shadow-lg shadow-green-500/20'
                        : d === 'medium'
                        ? 'bg-yellow-600/80 text-yellow-100 shadow-lg shadow-yellow-500/20'
                        : 'bg-red-600/80 text-red-100 shadow-lg shadow-red-500/20'
                      : 'bg-stone-700/40 text-stone-400 hover:bg-stone-600/40 hover:text-stone-300'
                  }`}
                >
                  {d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleStartGame('pve')}
              className="mt-5 px-12 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95"
            >
              开始游戏
            </button>
          </div>
        )}
      </div>

      {/* Rules modal */}
      {showRules && <GameRules onClose={() => setShowRules(false)} />}
    </div>
  );
}
