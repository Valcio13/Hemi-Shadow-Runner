/**
 * ScoreManager — owns the run's score and coin count.
 *
 * Two contributions to score:
 *  - Passive: distance/time survived (SCORE.PER_SECOND), so the number always
 *    ticks upward and surviving feels rewarding on its own.
 *  - Active: coins (COIN.SCORE_VALUE each), the skill-based bonus.
 *
 * Emits SCORE_CHANGED / COINS_CHANGED so the React HUD updates reactively.
 * Score is kept as a float internally (smooth accrual) and floored on read.
 */
import { COIN, SCORE } from '../config/GameConfig';
import { EventBus, GameEvents } from '../EventBus';

export class ScoreManager {
  private scoreFloat = 0;
  private coins = 0;
  private lastEmittedScore = -1;
  // Score multiplier (Genesis Shard power-up). 1 = normal. Applies to both
  // passive distance score and coin score through the single accrual path.
  private multiplier = 1;

  reset(): void {
    this.scoreFloat = 0;
    this.coins = 0;
    this.lastEmittedScore = -1;
    this.multiplier = 1;
    this.emitScore(true);
    this.emitCoins();
  }

  /** Set the active score multiplier (Genesis Shard on/off). */
  setMultiplier(mult: number): void {
    this.multiplier = mult;
  }

  /** Called each frame with seconds elapsed this frame. */
  addTime(dt: number): void {
    this.scoreFloat += dt * SCORE.PER_SECOND * this.multiplier;
    this.emitScore();
  }

  collectCoin(): void {
    this.coins += 1;
    this.scoreFloat += COIN.SCORE_VALUE * this.multiplier;
    this.emitCoins();
    this.emitScore(true);
  }

  get score(): number {
    return Math.floor(this.scoreFloat);
  }

  get coinCount(): number {
    return this.coins;
  }

  private emitScore(force = false): void {
    const s = this.score;
    // Only emit when the integer value actually changes — avoids spamming React
    // with 60 identical updates per second.
    if (force || s !== this.lastEmittedScore) {
      this.lastEmittedScore = s;
      EventBus.emit(GameEvents.SCORE_CHANGED, s);
    }
  }

  private emitCoins(): void {
    EventBus.emit(GameEvents.COINS_CHANGED, this.coins);
  }
}
