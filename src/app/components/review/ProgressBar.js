export default function ProgressBar({ current, total, timeRemaining }) {
  const progressPercent = (current / total) * 100;
  
  return (
    <div className="w-full mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span>{current} of {total} cards</span>
        <span>{timeRemaining}</span>
      </div>
      <div className="w-full bg-base-300 rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
} 