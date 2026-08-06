/**
 * MainMenu — the pre-run overlay shown while GameScene sits in attract mode
 * (phase === 'menu'). The world keeps scrolling behind it, so this panel is
 * deliberately semi-transparent and vertically compact.
 *
 * Start paths: the PLAY button, or Space / Enter (bound here rather than in
 * InputSystem, because InputSystem is disabled during the menu — the menu owns
 * keyboard focus until the run begins).
 */
import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { DEFAULT_CHAIN } from '../../game/config/Web3Config';
import { Leaderboard } from './Leaderboard';

interface MainMenuProps {
  highScore: number;
  onPlay: () => void;
}

/** Control legend rows — kept in one place so the menu and any future help
 * screen stay in sync. */
const CONTROLS: ReadonlyArray<{ keys: string; action: string }> = [
  { keys: 'SPACE / CLICK', action: 'Jump' },
  { keys: 'SHIFT / F', action: 'Phase shift (LIGHT ⇄ SHADOW)' },
  { keys: 'E', action: 'Dash — smash obstacles, magnet coins' },
  { keys: 'M', action: 'Mute' },
];

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function MainMenu({ highScore, onPlay }: MainMenuProps) {
  const wallet = useWallet();
  const connected = !!wallet.address;
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Space / Enter start the run. Bound on window because the Phaser canvas
  // has focus by default and InputSystem is disabled in attract mode.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        onPlay();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onPlay]);

  const handleConnect = () => {
    void wallet.connect();
  };

  if (showLeaderboard) {
    return <Leaderboard onClose={() => setShowLeaderboard(false)} />;
  }

  return (
    <div className="overlay overlay-menu">
      <div className="panel panel-menu">
        <div className="menu-eyebrow">HEMI NETWORK</div>
        <h1 className="menu-title">
          SHADOW<span className="menu-title-accent">RUNNER</span>
        </h1>
        <p className="menu-tagline">
          Phase between light and shadow. Outrun the chain.
        </p>

        {highScore > 0 && (
          <div className="menu-best">
            <span className="menu-best-label">BEST</span>
            <span className="menu-best-value">{highScore.toLocaleString()}</span>
          </div>
        )}

        <button className="btn btn-primary btn-play" onClick={onPlay} autoFocus>
          PLAY
        </button>
        <div className="menu-start-hint">or press SPACE</div>

        <button className="btn btn-ghost btn-leaderboard" onClick={() => setShowLeaderboard(true)}>
          🏆 View Leaderboard
        </button>

        {/* --- Wallet Connection --- */}
        {wallet.available && (
          <div className="menu-wallet">
            {!connected ? (
              <button 
                className="btn btn-wallet btn-wallet-menu" 
                onClick={handleConnect}
                disabled={wallet.connecting}
              >
                {wallet.connecting ? 'Connecting…' : `Connect to ${DEFAULT_CHAIN.name}`}
              </button>
            ) : (
              <div className="menu-wallet-connected">
                <div className="web3-account">
                  <span className="web3-dot" aria-hidden />
                  {short(wallet.address!)}
                  {!wallet.onHemi && <span className="web3-warn">wrong network</span>}
                </div>
                <div className="menu-wallet-hint">
                  Your scores will be submitted on-chain
                </div>
              </div>
            )}
          </div>
        )}

        {wallet.error && <p className="web3-error menu-wallet-error">{wallet.error}</p>}

        <div className="menu-controls">
          {CONTROLS.map((c) => (
            <div className="menu-control-row" key={c.keys}>
              <kbd className="menu-key">{c.keys}</kbd>
              <span className="menu-control-action">{c.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
