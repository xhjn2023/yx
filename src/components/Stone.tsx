interface StoneProps {
  color: 'black' | 'white';
  isLast: boolean;
  isWinning: boolean;
  onClick: () => void;
  size: number;
  isNew: boolean;
}

export default function Stone({ color, isLast, isWinning, onClick, size, isNew }: StoneProps) {
  const cellSize = size / 15;

  return (
    <div
      className={`absolute cursor-pointer transition-transform hover:scale-110 ${
        isWinning ? 'z-20' : 'z-10'
      }`}
      style={{
        width: cellSize,
        height: cellSize,
        animation: isNew ? 'stone-drop 0.3s ease-out' : undefined,
      }}
      onClick={onClick}
    >
      <div
        className={`absolute rounded-full transition-all duration-300 ${
          isWinning ? 'animate-pulse' : ''
        }`}
        style={{
          width: cellSize * 0.8,
          height: cellSize * 0.8,
          left: cellSize * 0.1,
          top: cellSize * 0.1,
          background:
            color === 'black'
              ? 'radial-gradient(circle at 35% 35%, #666, #111 60%, #000)'
              : 'radial-gradient(circle at 35% 35%, #fff, #e0e0e0 60%, #d0d0d0)',
          boxShadow: isWinning
            ? '0 0 15px 5px rgba(255,215,0,0.8), 0 4px 8px rgba(0,0,0,0.4)'
            : color === 'black'
            ? '0 2px 6px rgba(0,0,0,0.5)'
            : '0 2px 6px rgba(0,0,0,0.3)',
        }}
      >
        {isLast && (
          <div
            className="absolute rounded-full"
            style={{
              width: cellSize * 0.25,
              height: cellSize * 0.25,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: color === 'black' ? '#fff' : '#333',
              opacity: 0.7,
            }}
          />
        )}
      </div>
    </div>
  );
}
