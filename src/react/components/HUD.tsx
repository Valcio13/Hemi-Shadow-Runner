/**
 * HUD — the in-game overlay: score, coins, high score, dash meter.
 *
 * Rendered as an absolutely-positioned layer over the Phaser canvas. Pointer
 * events pass through (pointer-events: none) so clicks still reach the game for
 * jumping. Only visible during the 'playing' phase.
 */
import type { Phase } from '../hooks/useGameState';

interface HUDProps {
  phase: Phase;
  score: number;
  coins: number;
  highScore: number;
  dashMeter: number; // 0..1
  plane: 'light' | 'shadow';
  genesisMs: number; // Genesis Shard remaining ms (0 = inactive)
  chronoMs: number; // Chrono Fragment remaining ms (0 = inactive)
  hasRecovery: boolean; // Recovery Protocol stored
}

export function HUD({
  phase,
  score,
  coins,
  highScore,
  dashMeter,
  plane,
  genesisMs,
  chronoMs,
  hasRecovery,
}: HUDProps) {
  if (phase !== 'playing') return null;

  const ready = dashMeter >= 1;
  const genesisActive = genesisMs > 0;
  const chronoActive = chronoMs > 0;

  return (
    <div className="hud" aria-live="polite">
      <div className="hud-title" aria-hidden>
        HEMI <span className="hud-title-accent">SHADOW RUNNER</span>
      </div>
      <div className="hud-top-left">
        <div className="hud-score">{score.toLocaleString()}</div>
        <div className="hud-highscore">BEST {highScore.toLocaleString()}</div>
      </div>
      <div className="hud-top-right">
        <div className={`hud-coins ${genesisActive ? 'hud-coins-boosted' : ''}`}>
          <span className="hud-coin-dot" aria-hidden />
          {coins}
          {genesisActive && <span className="hud-coin-multiplier">×2</span>}
        </div>
      </div>

      {/* Power-up indicators (M8) */}
      <div className="hud-powerups">
        {genesisActive && (
          <div className="pu-badge pu-genesis" title="2× Score Multiplier">
            <span className="pu-icon">⭐</span>
            <span className="pu-label">2× SCORE</span>
            <span className="pu-timer">{Math.ceil(genesisMs / 1000)}s</span>
          </div>
        )}
        {chronoActive && (
          <div className="pu-badge pu-chrono" title="Time Warp">
            <span className="pu-icon">⏱️</span>
            <span className="pu-label">SLOW-MO</span>
            <span className="pu-timer">{Math.ceil(chronoMs / 1000)}s</span>
          </div>
        )}
        {hasRecovery && (
          <div className="pu-badge pu-recovery" title="Revive stored">
            <span className="pu-icon">💚</span>
            <span className="pu-label">REVIVE</span>
          </div>
        )}
      </div>

      <div className={`hud-plane hud-plane-${plane}`}>
        <span className="hud-plane-dot" aria-hidden />
        {plane === 'light' ? 'LIGHT' : 'SHADOW'}
        <span className="hud-plane-hint">SHIFT / F to phase</span>
      </div>

      <div className={`hud-dash ${ready ? 'is-ready' : ''}`}>
        <div className="hud-dash-label">
          {ready ? 'DASH READY — PRESS E' : 'DASH'}
        </div>
        <div className="hud-dash-bar">
          <div
            className="hud-dash-fill"
            style={{ width: `${Math.min(100, dashMeter * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
