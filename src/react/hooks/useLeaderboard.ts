/**
 * useLeaderboard - Fetch leaderboard data directly from blockchain
 * 
 * Fetches GameFinished events and builds leaderboard in real-time.
 * Uses browser localStorage for caching to improve performance.
 */
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { WEB3, DEFAULT_CHAIN } from '../../game/config/Web3Config';
import { GAME_CONTRACT_ABI } from '../../contracts/game-types';

export interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number; // Cumulative total score
  bestScore: number; // Best single game score
  gamesPlayed: number;
  lastPlayed: number;
  bestSessionId: string;
}

export interface LeaderboardData {
  lastUpdated: number;
  lastBlock: number;
  entries: LeaderboardEntry[];
}

interface CachedLeaderboard {
  lastBlock: number;
  entries: Record<string, Omit<LeaderboardEntry, 'rank'>>;
}

const CACHE_KEY = 'leaderboard-cache';
const DEPLOYMENT_BLOCK = 5020400; // Mainnet deployment block

export function useLeaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    let mounted = true;

    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load cached data
        let cachedData: CachedLeaderboard = { lastBlock: 0, entries: {} };
        try {
          const cached = localStorage.getItem(CACHE_KEY);
          if (cached) {
            cachedData = JSON.parse(cached);
          }
        } catch (err) {
          console.warn('Failed to load cache:', err);
        }

        // Setup provider and contract
        const provider = new ethers.JsonRpcProvider(DEFAULT_CHAIN.rpcUrls[0]);
        const contract = new ethers.Contract(
          WEB3.SCORE_CONTRACT!,
          GAME_CONTRACT_ABI,
          provider
        );

        // Get current block
        const currentBlock = await provider.getBlockNumber();
        
        // Determine starting block
        const fromBlock = cachedData.lastBlock === 0 
          ? DEPLOYMENT_BLOCK 
          : cachedData.lastBlock + 1;

        // Fetch new events if needed
        if (fromBlock <= currentBlock) {
          const filter = contract.filters.GameFinished();
          const events = await contract.queryFilter(filter, fromBlock, currentBlock);

          // Process events
          for (const event of events) {
            if (!('args' in event)) continue;
            
            const { sessionId, player, score, gamesPlayed } = event.args as any;
            const block = await event.getBlock();

            const existing = cachedData.entries[player];

            if (!existing) {
              // New player
              cachedData.entries[player] = {
                player,
                score: Number(score),
                bestScore: Number(score),
                gamesPlayed: Number(gamesPlayed),
                lastPlayed: block.timestamp,
                bestSessionId: sessionId.toString(),
              };
            } else {
              // Existing player - add to cumulative score
              const newScore = Number(score);
              existing.score += newScore;
              existing.gamesPlayed = Number(gamesPlayed);
              existing.lastPlayed = block.timestamp;

              // Track best single score
              if (newScore > existing.bestScore) {
                existing.bestScore = newScore;
                existing.bestSessionId = sessionId.toString();
              }
            }
          }

          // Update last processed block
          cachedData.lastBlock = currentBlock;

          // Save to localStorage
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
          } catch (err) {
            console.warn('Failed to save cache:', err);
          }
        }

        // Convert to array and sort
        const entries: LeaderboardEntry[] = Object.values(cachedData.entries)
          .sort((a, b) => b.score - a.score)
          .slice(0, 100) // Top 100
          .map((entry, index) => ({
            rank: index + 1,
            ...entry,
          }));

        if (mounted) {
          setData({
            lastUpdated: Date.now(),
            lastBlock: cachedData.lastBlock,
            entries,
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        if (mounted) {
          setError('Failed to load leaderboard from blockchain');
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [refreshTrigger]);

  return { data, loading, error, refresh };
}
