/**
 * usePlayerStats - Hook for fetching and displaying player statistics
 * 
 * Fetches player stats from:
 * 1. Smart contract (on-chain data)
 * 2. Leaderboard cache (computed stats)
 * 3. Local storage (offline games)
 */
import { useEffect, useState } from 'react';
import { useWallet } from './useWallet';
import { ethers } from 'ethers';
import { WEB3, DEFAULT_CHAIN } from '../../game/config/Web3Config';
import { GAME_CONTRACT_ABI } from '../../contracts/game-types';

export interface PlayerStats {
  // On-chain stats
  bestScore: number;
  gamesPlayed: number;
  
  // Computed stats
  cumulativeScore: number;
  rank: number | null;
  
  // Session history
  recentGames: {
    sessionId: string;
    score: number;
    timestamp: number;
    txHash: string;
  }[];
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export function usePlayerStats(): PlayerStats {
  const wallet = useWallet();
  const [stats, setStats] = useState<PlayerStats>({
    bestScore: 0,
    gamesPlayed: 0,
    cumulativeScore: 0,
    rank: null,
    recentGames: [],
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!wallet.address || !wallet.onHemi) {
      // Reset stats if wallet disconnected
      setStats({
        bestScore: 0,
        gamesPlayed: 0,
        cumulativeScore: 0,
        rank: null,
        recentGames: [],
        loading: false,
        error: null,
      });
      return;
    }

    const fetchStats = async () => {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      try {
        // Fetch on-chain stats from contract
        const provider = new ethers.JsonRpcProvider(DEFAULT_CHAIN.rpcUrls[0]);
        const contract = new ethers.Contract(
          WEB3.SCORE_CONTRACT!,
          GAME_CONTRACT_ABI,
          provider
        );
        
        const playerStats = await contract.getPlayerStats(wallet.address);
        
        // Fetch leaderboard to get cumulative score and rank
        let cumulativeScore = 0;
        let rank: number | null = null;
        
        try {
          const leaderboardResponse = await fetch('/leaderboard.json');
          if (leaderboardResponse.ok) {
            const leaderboard = await leaderboardResponse.json();
            const playerEntry = leaderboard.entries.find(
              (entry: any) => entry.player.toLowerCase() === wallet.address!.toLowerCase()
            );
            
            if (playerEntry) {
              cumulativeScore = playerEntry.score;
              rank = playerEntry.rank;
            }
          }
        } catch (err) {
          console.warn('Could not fetch leaderboard:', err);
        }
        
        // Fetch recent games from events
        const recentGames: PlayerStats['recentGames'] = [];
        
        try {
          const filter = contract.filters.GameFinished(null, wallet.address);
          const events = await contract.queryFilter(filter, -10000); // Last ~10k blocks
          
          // Get last 5 games
          const lastGames = events.slice(-5).reverse();
          
          for (const event of lastGames) {
            // Type guard to check if event is EventLog
            if ('args' in event) {
              const { sessionId, score } = event.args as any;
              const block = await event.getBlock();
              
              recentGames.push({
                sessionId: sessionId.toString(),
                score: Number(score),
                timestamp: block.timestamp,
                txHash: event.transactionHash,
              });
            }
          }
        } catch (err) {
          console.warn('Could not fetch recent games:', err);
        }
        
        setStats({
          bestScore: Number(playerStats.bestScore),
          gamesPlayed: Number(playerStats.gamesPlayed),
          cumulativeScore,
          rank,
          recentGames,
          loading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load stats',
        }));
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [wallet.address, wallet.onHemi]);

  return stats;
}
