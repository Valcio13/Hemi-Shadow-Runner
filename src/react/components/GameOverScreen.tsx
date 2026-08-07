/**
 * GameOverScreen — shown when phase === 'over'. Final score, coins, best,
 * Play Again button, and Share Score button for social features.
 *
 * Score submission now happens automatically in GameScene when the player dies,
 * so this screen focuses on displaying results and enabling social sharing.
 */
import { useState } from 'react';
import type { GameOverPayload } from '../hooks/useGameState';
import { ShareScore } from './ShareScore';

interface GameOverScreenProps {
  data: GameOverPayload;
  highScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  challengeScore?: number;
  beatChallenge?: boolean;
  sessionId?: string;
  txHash?: string;
}

export function GameOverScreen({
  data,
  highScore,
  onPlayAgain,
  onMainMenu,
  challengeScore,
  beatChallenge,
  sessionId,
  txHash,
}: GameOverScreenProps) {
  const isNewBest = data.score >= highScore && data.score > 0;
  const [showShare, setShowShare] = useState(false);

  // Show share modal if requested
  if (showShare) {
    return (
      <ShareScore
        score={data.score}
        coins={data.coins}
        sessionId={sessionId}
        txHash={txHash}
        onClose={() => setShowShare(false)}
      />
    );
  }

  return (
    <div className="overlay">
      <div className="panel">
        <h1 className="panel-title">Game Over</h1>

        {isNewBest && <div className="badge-best">NEW BEST!</div>}
        
        {/* Challenge Result */}
        {challengeScore && (
          <div className={`challenge-result ${beatChallenge ? 'challenge-won' : 'challenge-lost'}`}>
            {beatChallenge ? (
              <>
                <div className="challenge-result-icon">🏆</div>
                <div className="challenge-result-title">Challenge Completed!</div>
                <div className="challenge-result-text">
                  You beat the target of {challengeScore.toLocaleString()} by{' '}
                  {(data.score - challengeScore).toLocaleString()} points!
                </div>
              </>
            ) : (
              <>
                <div className="challenge-result-icon">💪</div>
                <div className="challenge-result-title">So Close!</div>
                <div className="challenge-result-text">
                  Target: {challengeScore.toLocaleString()} • You scored: {data.score.toLocaleString()}
                </div>
              </>
            )}
          </div>
        )}

        <div className="stat-row">
          <span className="stat-label">Score</span>
          <span className="stat-value">{data.score.toLocaleString()}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Coins</span>
          <span className="stat-value stat-coin">{data.coins}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Best</span>
          <span className="stat-value">{highScore.toLocaleString()}</span>
        </div>

        {/* Score submission note */}
        {txHash && (
          <div className="web3-success">
            <span className="web3-check" aria-hidden>✓</span>
            Score recorded on-chain
            <a
              href={`https://testnet.explorer.hemi.xyz/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="web3-tx-link"
            >
              View transaction
            </a>
          </div>
        )}

        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="btn btn-ghost" onClick={onMainMenu}>
            Main Menu
          </button>
          <button className="btn btn-ghost btn-share-trigger" onClick={() => setShowShare(true)}>
            🎉 Share Score
          </button>
        </div>
      </div>
    </div>
  );
}
