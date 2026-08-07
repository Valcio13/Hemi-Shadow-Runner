/**
 * PlayerStats - Display personal player statistics and achievements
 * 
 * Shows:
 * - Total games played
 * - Cumulative score
 * - Best single game
 * - Leaderboard rank
 * - Recent games history
 * - Achievement milestones
 */
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useWallet } from '../hooks/useWallet';
import { DEFAULT_CHAIN } from '../../game/config/Web3Config';

interface PlayerStatsProps {
  onClose: () => void;
}

function short(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  
  return new Date(timestamp * 1000).toLocaleDateString();
}

function getRankEmoji(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank <= 10) return '🏅';
  if (rank <= 50) return '⭐';
  return '🎮';
}

export function PlayerStats({ onClose }: PlayerStatsProps) {
  const wallet = useWallet();
  const stats = usePlayerStats();

  if (!wallet.address) {
    return (
      <div className="overlay">
        <div className="panel panel-stats">
          <div className="panel-header">
            <h1 className="panel-title">📊 Your Stats</h1>
            <button className="panel-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          
          <div className="stats-empty">
            <p>Connect your wallet to view your stats</p>
            <button className="btn btn-primary" onClick={() => wallet.connect()}>
              Connect Wallet
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!wallet.onHemi) {
    return (
      <div className="overlay">
        <div className="panel panel-stats">
          <div className="panel-header">
            <h1 className="panel-title">📊 Your Stats</h1>
            <button className="panel-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          
          <div className="stats-empty">
            <p>Switch to {DEFAULT_CHAIN.name} to view your stats</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overlay">
      <div className="panel panel-stats">
        <div className="panel-header">
          <h1 className="panel-title">📊 Your Stats</h1>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="stats-player-info">
          <div className="stats-address">
            <a
              href={`https://testnet.explorer.hemi.xyz/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="stats-address-link"
            >
              {short(wallet.address)}
            </a>
          </div>
          {stats.rank && (
            <div className="stats-rank-badge">
              {getRankEmoji(stats.rank)} Rank #{stats.rank}
            </div>
          )}
        </div>

        {stats.loading && (
          <div className="stats-loading">
            <div className="tx-spinner"></div>
            <p>Loading your stats...</p>
          </div>
        )}

        {stats.error && (
          <div className="stats-error">
            <p>{stats.error}</p>
          </div>
        )}

        {!stats.loading && !stats.error && (
          <>
            {/* Main Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-label">Games Played</div>
                <div className="stat-value">{stats.gamesPlayed}</div>
              </div>
              
              <div className="stat-card stat-highlight">
                <div className="stat-label">Total Score</div>
                <div className="stat-value">{stats.cumulativeScore.toLocaleString()}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Best Game</div>
                <div className="stat-value">{stats.bestScore.toLocaleString()}</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-label">Average</div>
                <div className="stat-value">
                  {stats.gamesPlayed > 0
                    ? Math.floor(stats.cumulativeScore / stats.gamesPlayed).toLocaleString()
                    : '0'}
                </div>
              </div>
            </div>

            {/* Recent Games */}
            {stats.recentGames.length > 0 && (
              <div className="stats-section">
                <h3 className="stats-section-title">Recent Games</h3>
                <div className="stats-recent">
                  {stats.recentGames.map((game) => (
                    <div key={game.sessionId} className="stats-game-row">
                      <div className="stats-game-score">
                        {game.score.toLocaleString()}
                      </div>
                      <div className="stats-game-time">
                        {timeAgo(game.timestamp)}
                      </div>
                      <a
                        href={`https://testnet.explorer.hemi.xyz/tx/${game.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="stats-game-link"
                        title="View transaction"
                      >
                        🔗
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements */}
            {stats.gamesPlayed > 0 && (
              <div className="stats-section">
                <h3 className="stats-section-title">Achievements</h3>
                <div className="stats-achievements">
                  <div className="achievement">
                    <span className="achievement-icon">🎮</span>
                    <span className="achievement-name">First Blood</span>
                  </div>
                  
                  {stats.gamesPlayed >= 10 && (
                    <div className="achievement">
                      <span className="achievement-icon">🔥</span>
                      <span className="achievement-name">Dedicated</span>
                    </div>
                  )}
                  
                  {stats.bestScore >= 1000 && (
                    <div className="achievement">
                      <span className="achievement-icon">⭐</span>
                      <span className="achievement-name">1K Club</span>
                    </div>
                  )}
                  
                  {stats.bestScore >= 5000 && (
                    <div className="achievement">
                      <span className="achievement-icon">💎</span>
                      <span className="achievement-name">Elite Player</span>
                    </div>
                  )}
                  
                  {stats.rank && stats.rank <= 10 && (
                    <div className="achievement">
                      <span className="achievement-icon">👑</span>
                      <span className="achievement-name">Top 10</span>
                    </div>
                  )}
                  
                  {stats.rank === 1 && (
                    <div className="achievement">
                      <span className="achievement-icon">🏆</span>
                      <span className="achievement-name">Champion</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {stats.gamesPlayed === 0 && (
              <div className="stats-empty">
                <p>No games played yet. Start playing to see your stats!</p>
              </div>
            )}
          </>
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
