import { X, BookOpen } from 'lucide-react';
import { useState } from 'react';

interface GameRulesProps {
  onClose?: () => void;
}

export default function GameRules({ onClose }: GameRulesProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div
        className="relative z-10 max-w-lg mx-4 p-8 rounded-3xl max-h-[80vh] overflow-y-auto animate-scale-in"
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          boxShadow: '0 0 60px rgba(255,215,0,0.2), 0 20px 60px rgba(0,0,0,0.5)',
        }}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-stone-700/50 text-stone-300 hover:bg-stone-600 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-6 h-6 text-amber-400" />
          <h2 className="text-2xl font-bold text-amber-200">游戏规则</h2>
        </div>

        <div className="space-y-4 text-stone-300">
          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">基本规则</h3>
            <ul className="space-y-1.5 text-sm">
              <li>• 在 15×15 的棋盘上进行对弈</li>
              <li>• 黑方先行，双方交替落子</li>
              <li>• 先将五枚棋子连成一线者获胜</li>
              <li>• 连线可以是水平、垂直或对角线方向</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">操作说明</h3>
            <ul className="space-y-1.5 text-sm">
              <li>• <span className="text-stone-100">点击棋盘交叉点</span> — 落子</li>
              <li>• <span className="text-stone-100">悔棋</span> — 撤回上一步（人机模式撤回两步）</li>
              <li>• <span className="text-stone-100">重新开始</span> — 清空棋盘重新开局</li>
              <li>• <span className="text-stone-100">返回</span> — 回到主页选择模式</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">游戏模式</h3>
            <ul className="space-y-1.5 text-sm">
              <li>• <span className="text-amber-200">双人对战</span> — 两位玩家轮流操作</li>
              <li>• <span className="text-amber-200">人机对战</span> — 挑战AI对手，可选难度</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">难度级别</h3>
            <ul className="space-y-1.5 text-sm">
              <li>• <span className="text-green-400">简单</span> — AI偶尔随机落子，适合新手</li>
              <li>• <span className="text-yellow-400">中等</span> — AI基本合理决策，偶有失误</li>
              <li>• <span className="text-red-400">困难</span> — AI全力以赴，谨慎决策</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-2">胜利条件</h3>
            <ul className="space-y-1.5 text-sm">
              <li>• 横、竖、斜任意方向连成五子即胜</li>
              <li>• 棋盘下满无人获胜则为平局</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
