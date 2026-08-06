/**
 * Web3System — thin wrapper over the injected EIP-1193 provider (MetaMask etc).
 *
 * Now includes full contract integration for ShadowRunnerGame:
 * - startGame() → get sessionId and gameSeed
 * - submitScore() → submit final score on-chain
 *
 * Uses ethers.js BrowserProvider for contract calls.
 */
import {
  DEFAULT_CHAIN,
  WEB3,
  buildScoreMessage,
} from '../config/Web3Config';
import { GAME_CONTRACT_ABI, type GameStartedEvent } from '../../contracts/game-types';
import { BrowserProvider, Contract, type TransactionReceipt } from 'ethers';

// Minimal shape of an EIP-1193 provider — only what we call.
interface Eip1193Provider {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, handler: (...args: unknown[]) => void): void;
  removeListener?(event: string, handler: (...args: unknown[]) => void): void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface WalletState {
  available: boolean; // an injected provider exists
  address: string | null;
  chainId: number | null;
  onHemi: boolean;
  connecting: boolean;
  error: string | null;
}

export interface Attestation {
  address: string;
  score: number;
  coins: number;
  timestamp: number;
  message: string;
  signature: string;
  chainId: number;
}

type Listener = (state: WalletState) => void;

export class Web3System {
  private provider: Eip1193Provider | null;
  private listeners = new Set<Listener>();

  private state: WalletState = {
    available: false,
    address: null,
    chainId: null,
    onHemi: false,
    connecting: false,
    error: null,
  };

  constructor() {
    this.provider = window.ethereum ?? null;
    this.state.available = !!this.provider;
    if (this.provider) this.attachListeners();
  }

  /**
   * Resolve the injected provider lazily. Wallet extensions frequently inject
   * `window.ethereum` a tick AFTER page load, so a provider missing at module
   * construction can appear by the time the user reaches the Game Over screen.
   */
  private resolveProvider(): Eip1193Provider | null {
    if (this.provider) return this.provider;
    if (window.ethereum) {
      this.provider = window.ethereum;
      this.attachListeners();
      this.patch({ available: true });
    }
    return this.provider;
  }

  private attachListeners(): void {
    if (!this.provider?.on) return;
    this.provider.on('accountsChanged', (...args: unknown[]) => {
      const accounts = args[0] as string[];
      this.patch({ address: accounts?.[0] ?? null });
    });
    this.provider.on('chainChanged', (...args: unknown[]) => {
      const chainIdHex = args[0] as string;
      const id = parseInt(chainIdHex, 16);
      this.patch({ chainId: id, onHemi: id === DEFAULT_CHAIN.chainId });
    });
  }

  getState(): WalletState {
    return { ...this.state };
  }

  /** Re-check for a late-injected provider. Called by React on mount. */
  refresh(): void {
    this.resolveProvider();
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.getState());
    return () => this.listeners.delete(fn);
  }

  private patch(next: Partial<WalletState>): void {
    this.state = { ...this.state, ...next };
    for (const fn of this.listeners) fn(this.getState());
  }

  /** Connect the wallet and ensure it's on the Hemi chain. */
  async connect(): Promise<void> {
    const provider = this.resolveProvider();
    if (!provider) {
      this.patch({ error: 'No wallet detected. Install MetaMask to submit.' });
      return;
    }
    this.patch({ connecting: true, error: null });
    try {
      const accounts = (await provider.request({
        method: 'eth_requestAccounts',
      })) as string[];
      const address = accounts?.[0] ?? null;

      const chainIdHex = (await provider.request({
        method: 'eth_chainId',
      })) as string;
      let chainId = parseInt(chainIdHex, 16);

      if (chainId !== DEFAULT_CHAIN.chainId) {
        await this.ensureHemiChain();
        chainId = DEFAULT_CHAIN.chainId;
      }

      this.patch({
        address,
        chainId,
        onHemi: chainId === DEFAULT_CHAIN.chainId,
        connecting: false,
      });
    } catch (err) {
      this.patch({ connecting: false, error: this.describe(err) });
    }
  }

  /** Switch to Hemi; if the wallet doesn't know it, add it then switch. */
  private async ensureHemiChain(): Promise<void> {
    if (!this.provider) return;
    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: DEFAULT_CHAIN.chainIdHex }],
      });
    } catch (err) {
      // 4902 = chain not added to the wallet yet.
      const code = (err as { code?: number })?.code;
      if (code === 4902) {
        await this.provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: DEFAULT_CHAIN.chainIdHex,
              chainName: DEFAULT_CHAIN.name,
              rpcUrls: DEFAULT_CHAIN.rpcUrls,
              nativeCurrency: DEFAULT_CHAIN.nativeCurrency,
              blockExplorerUrls: DEFAULT_CHAIN.blockExplorerUrls,
            },
          ],
        });
      } else {
        throw err;
      }
    }
  }

  /**
   * Start a new game session on-chain. Returns sessionId and gameSeed.
   * This should be called when the player clicks PLAY (if wallet is connected).
   */
  async startGameSession(): Promise<{ sessionId: bigint; gameSeed: number } | null> {
    if (!this.provider || !this.state.address) {
      this.patch({ error: 'Connect a wallet first.' });
      return null;
    }
    if (!this.state.onHemi) {
      this.patch({ error: `Switch to ${DEFAULT_CHAIN.name} to play.` });
      return null;
    }
    if (!WEB3.SCORE_CONTRACT) {
      this.patch({ error: 'Contract not configured.' });
      return null;
    }

    try {
      console.log('🔗 Creating browser provider...');
      const browserProvider = new BrowserProvider(this.provider as any);
      
      console.log('📝 Getting signer...');
      const signer = await browserProvider.getSigner();
      console.log('✅ Signer address:', await signer.getAddress());
      
      console.log('📜 Creating contract instance...');
      const contract = new Contract(WEB3.SCORE_CONTRACT, GAME_CONTRACT_ABI, signer);
      console.log('✅ Contract created at:', WEB3.SCORE_CONTRACT);

      console.log('🎮 Calling startGame()...');
      const tx = await contract.startGame();
      console.log('⏳ Transaction sent:', tx.hash);
      console.log('⏳ Waiting for confirmation...');
      
      const receipt: TransactionReceipt = await tx.wait();
      console.log('✅ Transaction confirmed!', receipt.hash);

      // Parse the GameStarted event to get sessionId and gameSeed
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
            if (parsed && parsed.name === 'GameStarted') {
              const sessionId = parsed.args.sessionId as bigint;
              const gameSeed = Number(parsed.args.gameSeed);
              
              console.log('🎲 Game started!', { sessionId: sessionId.toString(), gameSeed });
              this.patch({ error: null });
              return { sessionId, gameSeed };
            }
          } catch {
            // Not our event, continue
          }
        }
      }

      this.patch({ error: 'Failed to parse game start event.' });
      return null;
    } catch (err) {
      console.error('❌ Error starting game session:', err);
      this.patch({ error: this.describe(err) });
      return null;
    }
  }

  /**
   * Submit final score to the contract. Returns transaction hash on success.
   */
  async submitScoreOnChain(sessionId: bigint, score: number): Promise<string | null> {
    if (!this.provider || !this.state.address) {
      this.patch({ error: 'Connect a wallet first.' });
      return null;
    }
    if (!this.state.onHemi) {
      this.patch({ error: `Switch to ${DEFAULT_CHAIN.name} to submit.` });
      return null;
    }
    if (!WEB3.SCORE_CONTRACT) {
      this.patch({ error: 'Contract not configured.' });
      return null;
    }

    // Cap score at uint16 max (65535)
    const cappedScore = Math.min(Math.floor(score), 65535);

    try {
      const browserProvider = new BrowserProvider(this.provider as any);
      const signer = await browserProvider.getSigner();
      const contract = new Contract(WEB3.SCORE_CONTRACT, GAME_CONTRACT_ABI, signer);

      // Call submitScore() on the contract
      const tx = await contract.submitScore(sessionId, cappedScore);
      const receipt = await tx.wait();

      this.patch({ error: null });
      return receipt?.hash || null;
    } catch (err) {
      this.patch({ error: this.describe(err) });
      return null;
    }
  }

  /**
   * Produce a signed score attestation (gasless). Returns null on failure/reject.
   * When WEB3.SUBMISSION_MODE === 'contract' this is where an eth_sendTransaction
   * to WEB3.SCORE_CONTRACT would go instead — kept as a single seam.
   */
  async submitScore(score: number, coins: number): Promise<Attestation | null> {
    if (!this.provider || !this.state.address) {
      this.patch({ error: 'Connect a wallet first.' });
      return null;
    }
    if (!this.state.onHemi) {
      this.patch({ error: `Switch to ${DEFAULT_CHAIN.name} to submit.` });
      return null;
    }

    const address = this.state.address;
    const timestamp = Date.now();

    // NOTE: submitScore is now legacy - use submitScoreOnChain for contract mode
    if (WEB3.SUBMISSION_MODE === 'contract' && WEB3.SCORE_CONTRACT) {
      this.patch({ error: 'Use contract submission instead.' });
      return null;
    }

    const message = buildScoreMessage({ address, score, coins, timestamp });
    try {
      // personal_sign expects (message, address). MetaMask accepts a UTF-8
      // string directly for the message param.
      const signature = (await this.provider.request({
        method: 'personal_sign',
        params: [message, address],
      })) as string;

      this.patch({ error: null });
      return {
        address,
        score,
        coins,
        timestamp,
        message,
        signature,
        chainId: this.state.chainId ?? DEFAULT_CHAIN.chainId,
      };
    } catch (err) {
      this.patch({ error: this.describe(err) });
      return null;
    }
  }

  private describe(err: unknown): string {
    const code = (err as { code?: number })?.code;
    if (code === 4001) return 'Request rejected.';
    const msg = (err as { message?: string })?.message;
    return msg || 'Wallet error.';
  }
}

// Single shared instance — the game and React both talk to the same wallet.
export const web3 = new Web3System();

// Dev-only handle for in-browser verification.
if (import.meta.env.DEV) {
  (window as unknown as { __web3?: Web3System }).__web3 = web3;
}
