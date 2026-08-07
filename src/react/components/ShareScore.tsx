/**
 * ShareScore - Social sharing component for game scores
 * 
 * Features:
 * - Share score to Twitter/X
 * - Copy shareable link with challenge
 * - Generate score image/card
 * - Challenge friend via link
 */
import { useState } from 'react';
import { DEFAULT_CHAIN } from '../../game/config/Web3Config';

interface ShareScoreProps {
  score: number;
  coins: number;
  sessionId?: string;
  txHash?: string;
  onClose: () => void;
}

function generateShareText(score: number, coins: number): string {
  return `🎮 I just scored ${score.toLocaleString()} points in Shadow Runner on @hemi_xyz!\n\n🪙 Collected ${coins} coins\n⚡ Phase-shifting through light and shadow\n\nThink you can beat my score? 👀`;
}

function generateChallengeUrl(score: number, playerAddress?: string): string {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams({
    challenge: score.toString(),
  });
  
  // Add challenger address if available
  if (playerAddress) {
    params.set('from', playerAddress);
  }
  
  return `${baseUrl}?${params.toString()}`;
}

export function ShareScore({ score, coins, sessionId, txHash, onClose }: ShareScoreProps) {
  const [copied, setCopied] = useState(false);
  const [shareMethod, setShareMethod] = useState<'twitter' | 'copy' | null>(null);

  // Get player address from wallet (you'll need to import useWallet)
  const getPlayerAddress = (): string | undefined => {
    // Try to get from window.ethereum if available
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const accounts = (window as any).ethereum.selectedAddress;
      return accounts;
    }
    return undefined;
  };

  const playerAddress = getPlayerAddress();
  const shareText = generateShareText(score, coins);
  const challengeUrl = generateChallengeUrl(score, playerAddress);
  const explorerUrl = txHash 
    ? `${DEFAULT_CHAIN.blockExplorerUrls[0]}/tx/${txHash}`
    : null;

  const handleTwitterShare = () => {
    const twitterUrl = new URL('https://twitter.com/intent/tweet');
    let text = shareText;
    
    // Add challenge URL
    text += `\n\n${challengeUrl}`;
    
    // Add transaction proof if available
    if (explorerUrl) {
      text += `\n\n✅ Verified on-chain: ${explorerUrl}`;
    }
    
    twitterUrl.searchParams.set('text', text);
    twitterUrl.searchParams.set('hashtags', 'HemiNetwork,ShadowRunner,Web3Gaming');
    
    window.open(twitterUrl.toString(), '_blank', 'noopener,noreferrer');
    setShareMethod('twitter');
  };

  const handleCopyLink = async () => {
    const fullText = `${shareText}\n\n🔗 Challenge link: ${challengeUrl}${
      explorerUrl ? `\n\n✅ Proof: ${explorerUrl}` : ''
    }`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      setCopied(true);
      setShareMethod('copy');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleChallengeLink = async () => {
    try {
      await navigator.clipboard.writeText(challengeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="overlay">
      <div className="panel panel-share">
        <div className="panel-header">
          <h2 className="panel-title">🎉 Share Your Score</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Score Card */}
        <div className="share-score-card">
          <div className="share-score-main">
            <div className="share-score-label">Your Score</div>
            <div className="share-score-value">{score.toLocaleString()}</div>
          </div>
          <div className="share-score-meta">
            <div className="share-meta-item">
              <span className="share-meta-icon">🪙</span>
              <span className="share-meta-value">{coins} coins</span>
            </div>
            {sessionId && (
              <div className="share-meta-item">
                <span className="share-meta-icon">🎮</span>
                <span className="share-meta-value">Session #{sessionId}</span>
              </div>
            )}
          </div>
          {explorerUrl && (
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="share-proof-link"
            >
              ✅ Verified on-chain
            </a>
          )}
        </div>

        {/* Share Options */}
        <div className="share-options">
          <button className="btn btn-share btn-twitter" onClick={handleTwitterShare}>
            <span className="share-icon">𝕏</span>
            <span>Share on X (Twitter)</span>
          </button>

          <button className="btn btn-share btn-copy" onClick={handleCopyLink}>
            <span className="share-icon">{copied && shareMethod === 'copy' ? '✓' : '📋'}</span>
            <span>{copied && shareMethod === 'copy' ? 'Copied!' : 'Copy Share Text'}</span>
          </button>

          <button className="btn btn-share btn-challenge" onClick={handleChallengeLink}>
            <span className="share-icon">{copied && shareMethod !== 'copy' ? '✓' : '⚔️'}</span>
            <span>{copied && shareMethod !== 'copy' ? 'Copied!' : 'Copy Challenge Link'}</span>
          </button>
        </div>

        {/* Challenge Info */}
        <div className="share-challenge-info">
          <div className="share-challenge-title">🏆 Challenge Your Friends</div>
          <p className="share-challenge-text">
            Copy the challenge link and send it to friends. When they open it, they'll see your score as the target to beat!
          </p>
          <div className="share-challenge-url">
            {challengeUrl}
          </div>
        </div>

        {/* Share Preview */}
        {shareMethod && (
          <div className="share-preview">
            <div className="share-preview-title">Preview:</div>
            <pre className="share-preview-text">{shareText}</pre>
          </div>
        )}

        <div className="panel-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
