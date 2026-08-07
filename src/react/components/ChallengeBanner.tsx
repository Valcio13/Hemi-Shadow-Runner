/**
 * ChallengeBanner - Shows challenge target during gameplay
 * 
 * Displays the target score to beat and live progress
 */
interface ChallengeBannerProps {
  targetScore: number;
  currentScore: number;
}

export function ChallengeBanner({ targetScore, currentScore }: ChallengeBannerProps) {
  const remaining = Math.max(0, targetScore - currentScore);
  const progress = Math.min(100, (currentScore / targetScore) * 100);
  const isPassing = currentScore > targetScore;

  return (
    <div className={`challenge-banner ${isPassing ? 'challenge-passing' : ''}`}>
      <div className="challenge-header">
        <span className="challenge-icon">⚔️</span>
        <span className="challenge-label">CHALLENGE MODE</span>
      </div>
      
      <div className="challenge-scores">
        <div className="challenge-target">
          <span className="challenge-target-label">Target</span>
          <span className="challenge-target-value">{targetScore.toLocaleString()}</span>
        </div>
        
        {!isPassing ? (
          <div className="challenge-remaining">
            <span className="challenge-remaining-value">{remaining.toLocaleString()}</span>
            <span className="challenge-remaining-label">to go</span>
          </div>
        ) : (
          <div className="challenge-winning">
            <span className="challenge-winning-icon">🔥</span>
            <span className="challenge-winning-text">BEATING IT!</span>
          </div>
        )}
      </div>
      
      <div className="challenge-progress-bar">
        <div 
          className="challenge-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
