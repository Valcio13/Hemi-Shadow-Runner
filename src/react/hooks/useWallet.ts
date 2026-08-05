/**
 * useWallet — React binding for the shared Web3System singleton.
 *
 * Subscribes to wallet state (address / chain / connecting / error) and exposes
 * connect() + submitScore() so the GameOverScreen can drive the on-chain flow
 * without touching the provider directly.
 */
import { useCallback, useEffect, useState } from 'react';
import { web3, type WalletState, type Attestation } from '../../game/systems/Web3System';

export function useWallet() {
  const [state, setState] = useState<WalletState>(() => web3.getState());

  useEffect(() => {
    // A wallet extension may inject window.ethereum after our module loaded;
    // re-check on mount so a late provider flips `available` on.
    web3.refresh();
    return web3.subscribe(setState);
  }, []);

  const connect = useCallback(() => web3.connect(), []);
  const submitScore = useCallback(
    (score: number, coins: number): Promise<Attestation | null> =>
      web3.submitScore(score, coins),
    []
  );

  return { ...state, connect, submitScore };
}
