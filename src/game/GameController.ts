/**
 * GameController — the write side of the React↔Phaser bridge.
 *
 * React components need to *command* the game (start, restart) in addition to
 * listening via the EventBus. Rather than passing the Phaser.Game instance up
 * into React, we register a small command handler here. GameScene registers its
 * handlers on create; React calls the exported functions.
 * 
 * Now includes Web3 integration for on-chain game sessions.
 */
import { web3 } from './systems/Web3System';

type Handlers = {
  restart: () => void;
  start: (gameSeed?: number) => void;
  /** Return to the main menu / attract mode (M9). */
  mainMenu: () => void;
  dash: () => void;
  phase: () => void;
  toggleMute: () => void;
};

let handlers: Partial<Handlers> = {};

// Store the active session ID for score submission
let currentSessionId: bigint | null = null;

export function registerGameControls(h: Handlers): void {
  handlers = h;
}

export function unregisterGameControls(): void {
  handlers = {};
  currentSessionId = null;
}

export function getCurrentSessionId(): bigint | null {
  return currentSessionId;
}

export function requestRestart(): void {
  currentSessionId = null; // Clear session on restart
  handlers.restart?.();
}

/**
 * Start a new game. If wallet is connected, this will call the contract
 * to get a sessionId and gameSeed for on-chain verification.
 */
export async function requestStart(): Promise<void> {
  // Check if wallet is connected and on the right network
  const walletState = web3.getState();
  
  if (walletState.address && walletState.onHemi) {
    try {
      // Call the contract to start a game session
      const result = await web3.startGameSession();
      
      if (result) {
        currentSessionId = result.sessionId;
        console.log('🎮 Game session started:', {
          sessionId: result.sessionId.toString(),
          gameSeed: result.gameSeed,
        });
        
        // Start the game with the on-chain seed
        handlers.start?.(result.gameSeed);
      } else {
        // Failed to start session, but still allow offline play
        console.warn('⚠️ Failed to start on-chain session, playing offline');
        currentSessionId = null;
        handlers.start?.();
      }
    } catch (error) {
      console.error('❌ Error starting game session:', error);
      // Allow offline play even if on-chain fails
      currentSessionId = null;
      handlers.start?.();
    }
  } else {
    // No wallet or wrong network - play offline
    currentSessionId = null;
    handlers.start?.();
  }
}

export function requestDash(): void {
  handlers.dash?.();
}

export function requestPhase(): void {
  handlers.phase?.();
}

export function requestToggleMute(): void {
  handlers.toggleMute?.();
}

export function requestMainMenu(): void {
  currentSessionId = null;
  handlers.mainMenu?.();
}
