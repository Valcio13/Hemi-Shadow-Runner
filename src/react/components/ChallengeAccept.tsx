/**
 * ChallengeAccept - Modal shown when user arrives via challenge link
 * 
 * Displays challenger info and target score before starting game
 */

interface ChallengeAcceptProps {
  targetScore: number;
  challengerAddress?: string;
  onAccept: () => void;
  onDecline: () => void;
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function ChallengeAccept({ 
  targetScore, 
  challengerAddress,
  onAccept,
  onDecline 
}: ChallengeAcceptProps) {
  return (
    <div className="overlay challenge-accept-overlay">
      <div className="panel panel-challenge-accept">
        <div className="challenge-accept-header">
          <span className="challenge-accept-icon">⚔️</span>
          <h1 className="challenge-accept-title">Challenge Received!</h1>
        </div>

        {challengerAddress && (
          <div className="challenge-accept-from">
            <span className="challenge-from-label">From:</span>
            <span className="challenge-from-address">{shortenAddress(challengerAddress)}</span>
          </div>
        )}

        <div className="challenge-accept-score">
          <div className="challenge-accept-score-label">Target Score</div>
          <div className="challenge-accept-score-value">{targetScore.toLocaleString()}</div>
          <div className="challenge-accept-score-hint">Beat this score to win!</div>
        </div>

        <div className="challenge-accept-message">
          {challengerAddress ? (
            <>
              <p>
                <strong>{shortenAddress(challengerAddress)}</strong> has challenged you to beat their score of{' '}
                <strong>{targetScore.toLocaleString()}</strong> points!
              </p>
              <p>Think you can do it? 🎮</p>
            </>
          ) : (
            <p>
              Someone has challenged you to beat a score of{' '}
              <strong>{targetScore.toLocaleString()}</strong> points!
            </p>
          )}
        </div>

        <div className="challenge-accept-actions">
          <button className="btn btn-primary btn-challenge-accept" onClick={onAccept}>
            🔥 Accept Challenge
          </button>
          <button className="btn btn-ghost" onClick={onDecline}>
            Maybe Later
          </button>
        </div>

        <div className="challenge-accept-tip">
          💡 Tip: Your score will be automatically submitted to the blockchain!
        </div>
      </div>
    </div>
  );
}
