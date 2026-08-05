/**
 * GameController — the write side of the React↔Phaser bridge.
 *
 * React components need to *command* the game (start, restart) in addition to
 * listening via the EventBus. Rather than passing the Phaser.Game instance up
 * into React, we register a small command handler here. GameScene registers its
 * handlers on create; React calls the exported functions.
 */
type Handlers = {
  restart: () => void;
  start: () => void;
  /** Return to the main menu / attract mode (M9). */
  mainMenu: () => void;
  dash: () => void;
  phase: () => void;
  toggleMute: () => void;
};

let handlers: Partial<Handlers> = {};

export function registerGameControls(h: Handlers): void {
  handlers = h;
}

export function unregisterGameControls(): void {
  handlers = {};
}

export function requestRestart(): void {
  handlers.restart?.();
}

export function requestStart(): void {
  handlers.start?.();
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
  handlers.mainMenu?.();
}
