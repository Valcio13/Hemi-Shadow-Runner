/**
 * AudioSystem — procedural SFX via the Web Audio API. Zero binary assets: every
 * cue is a short oscillator with a frequency sweep and an exponential gain
 * envelope, mirroring how TextureFactory synthesizes all visuals.
 *
 * Browsers suspend the AudioContext until a user gesture; we lazily resume it on
 * the first play() call (which always originates from a key/pointer event here).
 *
 * Mute state persists to localStorage so a player's preference survives reloads.
 * The React HUD reads/writes it through EventBus (AUDIO_MUTE_CHANGED).
 */
import { AUDIO } from '../config/GameConfig';
import { EventBus, GameEvents } from '../EventBus';

type CueName =
  | 'JUMP'
  | 'LAND'
  | 'COIN'
  | 'PHASE'
  | 'DASH'
  | 'SMASH'
  | 'DEATH'
  | 'GENESIS'
  | 'CHRONO'
  | 'RECOVERY_PICKUP'
  | 'REVIVE';

export class AudioSystem {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private muted: boolean;

  constructor() {
    this.muted = localStorage.getItem(AUDIO.MUTE_KEY) === '1';
  }

  /** Create the context on first use so we're inside a user-gesture stack. */
  private ensureContext(): void {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return; // audio unsupported — fail silent, game still plays
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : AUDIO.MASTER_GAIN;
    this.master.connect(this.ctx.destination);
  }

  get isMuted(): boolean {
    return this.muted;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    localStorage.setItem(AUDIO.MUTE_KEY, muted ? '1' : '0');
    if (this.master) {
      this.master.gain.value = muted ? 0 : AUDIO.MASTER_GAIN;
    }
    EventBus.emit(GameEvents.AUDIO_MUTE_CHANGED, muted);
  }

  toggleMute(): void {
    this.setMuted(!this.muted);
  }

  /** Emit the current mute state so the HUD can initialize its icon. */
  emitState(): void {
    EventBus.emit(GameEvents.AUDIO_MUTE_CHANGED, this.muted);
  }

  play(cue: CueName): void {
    if (this.muted) return;
    this.ensureContext();
    if (!this.ctx || !this.master) return;
    if (this.ctx.state === 'suspended') void this.ctx.resume();

    const cfg = AUDIO[cue];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = cfg.type as OscillatorType;
    osc.frequency.setValueAtTime(cfg.startFreq, now);
    // Exponential ramp can't hit 0; endFreq values are all > 0 by design.
    osc.frequency.exponentialRampToValueAtTime(cfg.endFreq, now + cfg.dur);

    const env = this.ctx.createGain();
    // Fast attack, exponential decay to near-silence for a punchy transient.
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(cfg.gain, now + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, now + cfg.dur);

    osc.connect(env);
    env.connect(this.master);
    osc.start(now);
    osc.stop(now + cfg.dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }
}
