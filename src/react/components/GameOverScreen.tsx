/**
 * GameOverScreen — shown when phase === 'over'. Final score, coins, best, a
 * Play Again button, and the Hemi on-chain score submission (M7).
 *
 * Submission is a gasless attestation: connect wallet → ensure Hemi chain →
 * personal_sign a structured score message. The returned signature is shown
 * truncated with an explorer-agnostic "verified claim" confirmation. Swapping
 * to a real leaderboard tx is isolated in Web3System.submitScore.
 */
import { useState } from 'react';
import type { GameOverPayload } from '../hooks/useGameState';
import { useWallet } from '../hooks/useWallet';
import { DEFAULT_CHAIN } from '../../game/config/Web3Config';
import type { Attestation } from '../../game/systems/Web3System';

interface GameOverScreenProps {
  data: GameOverPayload;
  highScore: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function GameOverScreen({
  data,
  highScore,
  onPlayAgain,
  onMainMenu,
}: GameOverScreenProps) {
  const isNewBest = data.score >= highScore && data.score > 0;
  const wallet = useWallet();
  const [submitting, setSubmitting] = useState(false);
  const [attestation, setAttestation] = useState<Attestation | null>(null);

  const handleConnect = () => {
    void wallet.connect();
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await wallet.submitScore(data.score, data.coins);
    if (result) setAttestation(result);
    setSubmitting(false);
  };

  const connected = !!wallet.address;

  return (
    <div className="overlay">
      <div className="panel">
        <h1 className="panel-title">Game Over</h1>

        {isNewBest && <div className="badge-best">NEW BEST!</div>}

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

        {/* --- Hemi on-chain submission --- */}
        <div className="web3-block">
          {!wallet.available && (
            <p className="web3-hint">
              Install a wallet (MetaMask) to record your score on {DEFAULT_CHAIN.name}.
            </p>
          )}

          {wallet.available && !connected && (
            <button className="btn btn-wallet" onClick={handleConnect} disabled={wallet.connecting}>
              {wallet.connecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}

          {connected && !attestation && (
            <>
              <div className="web3-account">
                <span className="web3-dot" aria-hidden />
                {short(wallet.address!)}
                {!wallet.onHemi && <span className="web3-warn">wrong network</span>}
              </div>
              <button
                className="btn btn-wallet"
                onClick={handleSubmit}
                disabled={submitting || !wallet.onHemi}
              >
                {submitting ? 'Sign in wallet…' : `Submit to ${DEFAULT_CHAIN.name}`}
              </button>
            </>
          )}

          {attestation && (
            <div className="web3-success">
              <span className="web3-check" aria-hidden>✓</span>
              Score attested on {DEFAULT_CHAIN.name}
              <code className="web3-sig">{short(attestation.signature)}</code>
            </div>
          )}

          {wallet.error && <p className="web3-error">{wallet.error}</p>}
        </div>

        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            Play Again
          </button>
          <button className="btn btn-ghost" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
