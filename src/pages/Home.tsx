import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../stores/gameStore';
import { Swords, Bot } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const initGame = useGameStore(s => s.initGame);

  const handleStartGame = useCallback((mode: 'pvp' | 'pve') => {
    initGame(mode);
    navigate('/game');
  }, [initGame, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
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

      {/* Main content */}
      <div className="relative z-10 text-center px-8 animate-fade-in">
        {/* Title */}
        <div className="mb-16">
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-300 mb-4 tracking-wider" style={{ textShadow: '0 0 40px rgba(255,215,0,0.3)' }}>
            五子棋
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-amber-400/60" />
            <p className="text-amber-200/70 text-lg tracking-widest font-light">GOMOKU</p>
            <div className="w-16 h-0.5 bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>
        </div>

        {/* Mode selection buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <button
            onClick={() => handleStartGame('pvp')}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-br from-amber-800/60 to-amber-900/80 border border-amber-600/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-amber-300 group-hover:text-amber-200 transition-colors" />
              <span className="text-xl text-amber-100 font-medium group-hover:text-white transition-colors">
                双人对战
              </span>
            </div>
            <p className="text-amber-300/50 text-sm mt-2 group-hover:text-amber-300/70 transition-colors">
              与朋友面对面博弈
            </p>
          </button>

          <button
            onClick={() => handleStartGame('pve')}
            className="group relative px-10 py-5 rounded-2xl bg-gradient-to-br from-stone-700/60 to-stone-800/80 border border-stone-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-stone-400/50 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-stone-300 group-hover:text-stone-200 transition-colors" />
              <span className="text-xl text-stone-100 font-medium group-hover:text-white transition-colors">
                人机对战
              </span>
            </div>
            <p className="text-stone-300/50 text-sm mt-2 group-hover:text-stone-300/70 transition-colors">
              挑战AI智能对手
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
