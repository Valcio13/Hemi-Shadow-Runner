/**
 * EventBus — the single channel between Phaser and React.
 *
 * Phaser scenes emit gameplay events (score changes, game over, dash ready);
 * React HUD/menu components subscribe. This keeps the two worlds decoupled:
 * neither imports the other's internals, they only agree on event names.
 */
import Phaser from 'phaser';

export const EventBus = new Phaser.Events.EventEmitter();

/** Strongly-typed event names to avoid stringly-typed bugs. */
export const GameEvents = {
  READY: 'game:ready',
  SCORE_CHANGED: 'game:score-changed',
  COINS_CHANGED: 'game:coins-changed',
  DASH_CHANGED: 'game:dash-changed',
  DASH_ACTIVATED: 'game:dash-activated',
  SHADOW_CHANGED: 'game:shadow-changed',
  AUDIO_MUTE_CHANGED: 'game:audio-mute-changed',
  // Power-up HUD events (M8). Payloads carry remaining ms / availability.
  GENESIS_CHANGED: 'game:genesis-changed',
  CHRONO_CHANGED: 'game:chrono-changed',
  RECOVERY_CHANGED: 'game:recovery-changed',
  GAME_OVER: 'game:over',
  GAME_STARTED: 'game:started',
  // Main menu (M9): emitted when the scene enters attract mode, so React can
  // show the menu overlay. Fired on boot and on "Main Menu" from game over.
  MENU_SHOWN: 'game:menu-shown',
  REQUEST_START: 'ui:request-start',
  REQUEST_RESTART: 'ui:request-restart',
} as const;

export type GameEventName = (typeof GameEvents)[keyof typeof GameEvents];
