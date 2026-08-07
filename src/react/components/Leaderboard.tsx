/**
 * Leaderboard — displays top scores from on-chain events
 * 
 * Fetches data directly from blockchain in real-time
 * Shows rank, player address, score, games played, and last played date
 */
import { useLeaderboard } from '../hooks/useLeaderboard';

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

interface LeaderboardProps {
  onClose: () => void;
}

export function Leaderboard({ onClose }: LeaderboardProps) {
  const { data, loading, error, refresh } = useLeaderboard();

  return (
    <div className="overlay">
      <div className="panel panel-leaderboard">
        <div className="panel-header">
          <h1 className="panel-title">🏆 Leaderboard</h1>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading && (
          <div className="leaderboard-loading">
            <div className="tx-spinner"></div>
            <p>Loading scores...</p>
          </div>
        )}

        {error && (
          <div className="leaderboard-error">
            <p>{error}</p>
          </div>
        )}

        {data && !loading && (
          <>
            <div className="leaderboard-meta">
              <span>📡 Block {data.lastBlock.toLocaleString()}</span>
              <span>🔄 {timeAgo(Math.floor(data.lastUpdated / 1000))}</span>
            </div>

            <div className="leaderboard-table">
              <div className="leaderboard-header">
                <div className="lb-col lb-rank">#</div>
                <div className="lb-col lb-player">Player</div>
                <div className="lb-col lb-score">Total Score</div>
                <div className="lb-col lb-best">Best</div>
                <div className="lb-col lb-games">Games</div>
                <div className="lb-col lb-time">Last Played</div>
              </div>

              <div className="leaderboard-body">
                {data.entries.length === 0 ? (
                  <div className="leaderboard-empty">
                    <p>No scores yet. Be the first to play!</p>
                  </div>
                ) : (
                  data.entries.map((entry) => (
                    <div key={entry.player} className="leaderboard-row">
                      <div className="lb-col lb-rank">
                        {entry.rank === 1 && '🥇'}
                        {entry.rank === 2 && '🥈'}
                        {entry.rank === 3 && '🥉'}
                        {entry.rank > 3 && entry.rank}
                      </div>
                      <div className="lb-col lb-player">
                        <a
                          href={`https://explorer.hemi.xyz/address/${entry.player}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lb-player-link"
                        >
                          {short(entry.player)}
                        </a>
                      </div>
                      <div className="lb-col lb-score">{entry.score.toLocaleString()}</div>
                      <div className="lb-col lb-best">
                        {entry.bestScore ? entry.bestScore.toLocaleString() : '-'}
                      </div>
                      <div className="lb-col lb-games">{entry.gamesPlayed}</div>
                      <div className="lb-col lb-time">{timeAgo(entry.lastPlayed)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        <div className="panel-actions">
          <button className="btn btn-ghost" onClick={refresh} disabled={loading}>
            {loading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
          <button className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
