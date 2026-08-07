/**
 * useChallenge - Hook for handling challenge mode
 * 
 * When a user arrives via a challenge link (?challenge=1234),
 * this hook extracts the target score and manages the challenge state
 */
import { useState, useEffect } from 'react';

export interface ChallengeState {
  active: boolean;
  targetScore: number;
  beaten: boolean;
  difference: number;
}

export function useChallenge() {
  const [challenge, setChallenge] = useState<ChallengeState>({
    active: false,
    targetScore: 0,
    beaten: false,
    difference: 0,
  });

  useEffect(() => {
    // Check URL for challenge parameter
    const params = new URLSearchParams(window.location.search);
    const challengeScore = params.get('challenge');
    
    if (challengeScore) {
      const targetScore = parseInt(challengeScore, 10);
      
      if (!isNaN(targetScore) && targetScore > 0) {
        setChallenge({
          active: true,
          targetScore,
          beaten: false,
          difference: 0,
        });
        
        // Clean URL (optional - keeps challenge in URL for sharing)
        // window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const checkScore = (playerScore: number) => {
    if (!challenge.active) return;

    const beaten = playerScore > challenge.targetScore;
    const difference = playerScore - challenge.targetScore;

    setChallenge((prev) => ({
      ...prev,
      beaten,
      difference,
    }));

    return { beaten, difference };
  };

  const clearChallenge = () => {
    setChallenge({
      active: false,
      targetScore: 0,
      beaten: false,
      difference: 0,
    });
    
    // Clean URL
    window.history.replaceState({}, '', window.location.pathname);
  };

  return {
    challenge,
    checkScore,
    clearChallenge,
  };
}
