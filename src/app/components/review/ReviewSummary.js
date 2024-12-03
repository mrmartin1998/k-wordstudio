import { getLevelColor, getLevelText } from '@/lib/utils';

export default function ReviewSummary({ stats, onRestart, onClose }) {
  const accuracy = Math.round((stats.correctCount / stats.totalReviewed) * 100) || 0;
  
  return (
    <div className="card bg-base-200 shadow-xl max-w-2xl mx-auto">
      <div className="card-body">
        <h2 className="card-title text-center mb-6">Review Session Complete!</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="stat bg-base-300 rounded-box">
            <div className="stat-title">Cards Reviewed</div>
            <div className="stat-value">{stats.totalReviewed}</div>
          </div>
          
          <div className="stat bg-base-300 rounded-box">
            <div className="stat-title">Accuracy</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Level Changes</h3>
            <div className="flex gap-2 flex-wrap">
              {stats.levelChanges.map((count, level) => (
                <div key={level} className={`badge ${getLevelColor(level)} badge-lg`}>
                  {getLevelText(level)}: {count}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card-actions justify-end mt-6">
          <button className="btn btn-primary" onClick={onRestart}>
            Start New Session
          </button>
          <button className="btn" onClick={onClose}>
            Back to Flashcards
          </button>
        </div>
      </div>
    </div>
  );
} 