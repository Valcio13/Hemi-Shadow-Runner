/**
 * TypeScript interfaces for ShadowRunnerLeaderboard contract
 * These types match the Solidity contract structs
 */

export interface Score {
  player: string; // Ethereum address
  score: bigint;
  coins: bigint;
  timestamp: bigint; // Unix timestamp
  gameSessionId: string; // bytes32 as hex string
}

export interface PlayerStats {
  highScore: bigint;
  totalGames: bigint;
  totalCoins: bigint;
  lastPlayedAt: bigint; // Unix timestamp
}

/**
 * Contract ABI for essential functions
 * Use with ethers.js Contract or BrowserProvider
 */
export const LEADERBOARD_ABI = [
  // Write functions
  "function submitScore(uint256 _score, uint256 _coins, bytes32 _gameSessionId)",
  "function submitScoreWithSignature(uint256 _score, uint256 _coins, bytes32 _gameSessionId, bytes memory _signature)",
  
  // Read functions - Leaderboards
  "function getGlobalLeaderboard(uint256 _offset, uint256 _limit) view returns (tuple(address player, uint256 score, uint256 coins, uint256 timestamp, bytes32 gameSessionId)[])",
  "function getDailyLeaderboard(uint256 _offset, uint256 _limit) view returns (tuple(address player, uint256 score, uint256 coins, uint256 timestamp, bytes32 gameSessionId)[])",
  "function getHistoricalDailyLeaderboard(uint256 _dayNumber, uint256 _offset, uint256 _limit) view returns (tuple(address player, uint256 score, uint256 coins, uint256 timestamp, bytes32 gameSessionId)[])",
  
  // Read functions - Player data
  "function getPlayerStats(address _player) view returns (tuple(uint256 highScore, uint256 totalGames, uint256 totalCoins, uint256 lastPlayedAt))",
  "function getPlayerScores(address _player, uint256 _offset, uint256 _limit) view returns (tuple(address player, uint256 score, uint256 coins, uint256 timestamp, bytes32 gameSessionId)[])",
  "function getPlayerRank(address _player) view returns (uint256)",
  
  // Read functions - Info
  "function getGlobalLeaderboardSize() view returns (uint256)",
  "function getDailyLeaderboardSize() view returns (uint256)",
  "function getCurrentDay() view returns (uint256)",
  "function gameVersion() view returns (string)",
  "function minimumScore() view returns (uint256)",
  "function paused() view returns (bool)",
  "function owner() view returns (address)",
  
  // Admin functions (owner only)
  "function setMinimumScore(uint256 _newMinimum)",
  "function setGameVersion(string _newVersion)",
  "function pause()",
  "function unpause()",
  "function removeScore(address _player, bytes32 _gameSessionId)",
  
  // Events
  "event ScoreSubmitted(address indexed player, uint256 score, uint256 coins, uint256 timestamp, bytes32 gameSessionId)",
  "event NewHighScore(address indexed player, uint256 newHighScore, uint256 previousHighScore)",
  "event LeaderboardUpdated(address indexed player, uint256 rank, uint256 score)",
] as const;

/**
 * Helper functions for working with the contract
 */

/**
 * Generate a unique session ID for a game
 * @param address Player's wallet address
 * @param score Final score
 * @param timestamp Current timestamp
 * @returns bytes32 session ID as hex string
 */
export function generateSessionId(
  address: string,
  score: number,
  timestamp: number
): string {
  // Use ethers.js if available
  if (typeof window !== 'undefined' && (window as any).ethers) {
    const ethers = (window as any).ethers;
    return ethers.id(`${address}-${score}-${timestamp}`);
  }
  
  // Fallback to basic implementation
  const data = `${address}-${score}-${timestamp}`;
  return `0x${Array.from(data)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('')
    .padEnd(64, '0')
    .substring(0, 64)}`;
}

/**
 * Format a BigInt score for display
 * @param score Score as BigInt
 * @returns Formatted string with commas
 */
export function formatScore(score: bigint): string {
  return score.toLocaleString();
}

/**
 * Format a timestamp for display
 * @param timestamp Unix timestamp as BigInt
 * @returns Formatted date/time string
 */
export function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

/**
 * Shorten an Ethereum address for display
 * @param address Full Ethereum address
 * @returns Shortened address (0x1234...5678)
 */
export function shortenAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Calculate time ago from timestamp
 * @param timestamp Unix timestamp as BigInt
 * @returns Human-readable time ago string
 */
export function timeAgo(timestamp: bigint): string {
  const now = Math.floor(Date.now() / 1000);
  const secondsAgo = now - Number(timestamp);
  
  if (secondsAgo < 60) return 'just now';
  if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)}m ago`;
  if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)}h ago`;
  if (secondsAgo < 604800) return `${Math.floor(secondsAgo / 86400)}d ago`;
  
  return formatTimestamp(timestamp);
}

/**
 * Leaderboard pagination helper
 */
export interface PaginationParams {
  offset: number;
  limit: number;
}

export function createPagination(page: number, pageSize: number): PaginationParams {
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

/**
 * Contract interaction result types
 */
export interface ContractCallResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionHash?: string;
}

export type LeaderboardType = 'global' | 'daily' | 'historical';

export interface LeaderboardQuery {
  type: LeaderboardType;
  page: number;
  pageSize: number;
  dayNumber?: number; // For historical queries
}
