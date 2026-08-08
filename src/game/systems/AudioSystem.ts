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
  private bgMusic: HTMLAudioElement | null = null;
  private bgMusicGain: GainNode | null = null;
  private bgMusicSource: MediaElementAudioSourceNode | null = null;
  private musicVolume: number = 0.85;
  private sfxVolume: number = 1.0;

  constructor() {
    this.muted = localStorage.getItem(AUDIO.MUTE_KEY) === '1';
    
    // Load saved volumes
    const savedMusic = localStorage.getItem('music-volume');
    const savedSfx = localStorage.getItem('sfx-volume');
    if (savedMusic) this.musicVolume = parseInt(savedMusic) / 100;
    if (savedSfx) this.sfxVolume = parseInt(savedSfx) / 100;
    
    // Listen for volume changes from UI
    EventBus.on(GameEvents.MUSIC_VOLUME_CHANGED, this.setMusicVolume, this);
    EventBus.on(GameEvents.SFX_VOLUME_CHANGED, this.setSfxVolume, this);
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
    // Also mute/unmute background music
    if (this.bgMusic) {
      this.bgMusic.muted = muted;
    }
    EventBus.emit(GameEvents.AUDIO_MUTE_CHANGED, muted);
  }

  toggleMute(): void {
    this.setMuted(!this.muted);
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.bgMusic) {
      this.bgMusic.volume = this.musicVolume;
    }
    if (this.bgMusicGain) {
      this.bgMusicGain.gain.value = this.musicVolume;
    }
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    // Master gain will be applied to all sound effects
    if (this.master && !this.muted) {
      this.master.gain.value = AUDIO.MASTER_GAIN * this.sfxVolume;
    }
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

  /**
   * Start background music. Should be called once when gameplay begins.
   * The music will loop indefinitely until stopped.
   */
  startBackgroundMusic(): void {
    this.ensureContext();
    if (!this.ctx) return;

    // Only create the audio element once
    if (!this.bgMusic) {
      this.bgMusic = new Audio('/slimeyfox-gameotoon-481311.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = this.musicVolume; // Use saved/current volume
      this.bgMusic.muted = this.muted;

      // Connect to Web Audio API for better control
      if (this.ctx && this.master && !this.bgMusicSource) {
        try {
          this.bgMusicSource = this.ctx.createMediaElementSource(this.bgMusic);
          this.bgMusicGain = this.ctx.createGain();
          this.bgMusicGain.gain.value = this.musicVolume;
          this.bgMusicSource.connect(this.bgMusicGain);
          this.bgMusicGain.connect(this.master);
        } catch (err) {
          // MediaElementSource can only be created once
          console.warn('Background music source already created');
        }
      }
    }

    // Resume audio context if suspended
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    // Start playing
    void this.bgMusic.play().catch((err) => {
      console.warn('Background music autoplay blocked:', err);
    });
  }

  /**
   * Stop background music (e.g., when returning to menu or game over)
   */
  stopBackgroundMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  }

  /**
   * Pause background music without resetting position
   */
  pauseBackgroundMusic(): void {
    if (this.bgMusic) {
      this.bgMusic.pause();
    }
  }

  /**
   * Resume background music from where it was paused
   */
  resumeBackgroundMusic(): void {
    if (this.bgMusic && this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      void this.bgMusic.play().catch((err) => {
        console.warn('Failed to resume background music:', err);
      });
    }
  }
}
