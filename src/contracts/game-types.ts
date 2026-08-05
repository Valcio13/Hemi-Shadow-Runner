/**
 * TypeScript interfaces for ShadowRunnerGame contract
 * Minimal game session management
 */

export interface GameSession {
  player: string;         // Ethereum address
  gameSeed: number;       // uint32
  startBlock: number;     // uint32
  finalScore: number;     // uint16
  finished: boolean;
}

export interface PlayerStats {
  bestScore: number;      // uint16
  gamesPlayed: number;    // uint16
}

/**
 * Minimal ABI for ShadowRunnerGame contract
 */
export const GAME_CONTRACT_ABI = [
  // Write functions
  "function startGame() external returns (uint256 sessionId, uint32 gameSeed)",
  "function submitScore(uint256 sessionId, uint16 score) external",
  
  // Read functions
  "function getSession(uint256 sessionId) external view returns (tuple(address player, uint32 gameSeed, uint32 startBlock, uint16 finalScore, bool finished))",
  "function getPlayerStats(address player) external view returns (tuple(uint16 bestScore, uint16 gamesPlayed))",
  "function isSessionActive(uint256 sessionId) external view returns (bool)",
  "function nextSessionId() external view returns (uint256)",
  
  // Events
  "event GameStarted(uint256 indexed sessionId, address indexed player, uint32 gameSeed, uint32 startBlock)",
  "event GameFinished(uint256 indexed sessionId, address indexed player, uint16 score, uint16 gamesPlayed)",
  "event NewHighScore(address indexed player, uint16 newBestScore, uint16 previousBestScore)",
] as const;

/**
 * Parse GameStarted event from transaction receipt
 */
export interface GameStartedEvent {
  sessionId: bigint;
  player: string;
  gameSeed: number;
  startBlock: number;
}

/**
 * Parse GameFinished event from transaction receipt
 */
export interface GameFinishedEvent {
  sessionId: bigint;
  player: string;
  score: number;
  gamesPlayed: number;
}

/**
 * Leaderboard entry (from indexed events)
 */
export interface LeaderboardEntry {
  sessionId: string;
  player: string;
  score: number;
  timestamp: number;
  blockNumber: number;
  txHash: string;
}

/**
 * Helper: Format display strings
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export function formatScore(score: number): string {
  return score.toLocaleString();
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function timeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - timestamp;
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  
  return formatTimestamp(timestamp);
}
