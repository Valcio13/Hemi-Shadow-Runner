/**
 * useGameState — subscribes React to the Phaser EventBus.
 *
 * This is the read side of the bridge: gameplay systems emit, this hook
 * translates those emissions into React state so HUD components re-render.
 * All listeners are cleaned up on unmount to avoid leaks across scene restarts.
 */
import { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '../../game/EventBus';

export interface GameOverPayload {
  score: number;
  coins: number;
  elapsed: number;
}

export type Phase = 'boot' | 'menu' | 'playing' | 'over';

export interface GameState {
  phase: Phase;
  score: number;
  coins: number;
  gameOver: GameOverPayload | null;
}

const HIGH_SCORE_KEY = 'hsr:highscore';

export function readHighScore(): number {
  const raw = localStorage.getItem(HIGH_SCORE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

export function writeHighScore(score: number): void {
  localStorage.setItem(HIGH_SCORE_KEY, String(score));
}

export function useGameState() {
  const [phase, setPhase] = useState<Phase>('boot');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [dashMeter, setDashMeter] = useState(0);
  const [plane, setPlane] = useState<'light' | 'shadow'>('light');
  const [muted, setMuted] = useState(false);
  // Power-ups (M8): remaining ms for timed effects, bool for stored revive.
  const [genesisMs, setGenesisMs] = useState(0);
  const [chronoMs, setChronoMs] = useState(0);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [gameOver, setGameOver] = useState<GameOverPayload | null>(null);
  const [highScore, setHighScore] = useState<number>(() => readHighScore());

  useEffect(() => {
    const onScore = (s: number) => setScore(s);
    const onCoins = (c: number) => setCoins(c);
    const onDash = (m: number) => setDashMeter(m);
    const onShadow = (p: 'light' | 'shadow') => setPlane(p);
    const onMute = (m: boolean) => setMuted(m);
    const onGenesis = (ms: number) => setGenesisMs(ms);
    const onChrono = (ms: number) => setChronoMs(ms);
    const onRecovery = (has: boolean) => setHasRecovery(has);
    const onStarted = () => {
      setGameOver(null);
      setScore(0);
      setCoins(0);
      setDashMeter(0);
      setPlane('light');
      setGenesisMs(0);
      setChronoMs(0);
      setHasRecovery(false);
      setPhase('playing');
    };
    const onOver = (payload: GameOverPayload) => {
      setGameOver(payload);
      setPhase('over');
      if (payload.score > readHighScore()) {
        writeHighScore(payload.score);
        setHighScore(payload.score);
      }
    };
    // M9: scene entered attract mode — show the main menu overlay.
    const onMenu = () => {
      setGameOver(null);
      setScore(0);
      setCoins(0);
      setDashMeter(0);
      setPlane('light');
      setGenesisMs(0);
      setChronoMs(0);
      setHasRecovery(false);
      setPhase('menu');
    };

    EventBus.on(GameEvents.SCORE_CHANGED, onScore);
    EventBus.on(GameEvents.COINS_CHANGED, onCoins);
    EventBus.on(GameEvents.DASH_CHANGED, onDash);
    EventBus.on(GameEvents.SHADOW_CHANGED, onShadow);
    EventBus.on(GameEvents.AUDIO_MUTE_CHANGED, onMute);
    EventBus.on(GameEvents.GENESIS_CHANGED, onGenesis);
    EventBus.on(GameEvents.CHRONO_CHANGED, onChrono);
    EventBus.on(GameEvents.RECOVERY_CHANGED, onRecovery);
    EventBus.on(GameEvents.GAME_STARTED, onStarted);
    EventBus.on(GameEvents.GAME_OVER, onOver);
    EventBus.on(GameEvents.MENU_SHOWN, onMenu);

    return () => {
      EventBus.off(GameEvents.SCORE_CHANGED, onScore);
      EventBus.off(GameEvents.COINS_CHANGED, onCoins);
      EventBus.off(GameEvents.DASH_CHANGED, onDash);
      EventBus.off(GameEvents.SHADOW_CHANGED, onShadow);
      EventBus.off(GameEvents.AUDIO_MUTE_CHANGED, onMute);
      EventBus.off(GameEvents.GENESIS_CHANGED, onGenesis);
      EventBus.off(GameEvents.CHRONO_CHANGED, onChrono);
      EventBus.off(GameEvents.RECOVERY_CHANGED, onRecovery);
      EventBus.off(GameEvents.GAME_STARTED, onStarted);
      EventBus.off(GameEvents.GAME_OVER, onOver);
      EventBus.off(GameEvents.MENU_SHOWN, onMenu);
    };
  }, []);

  return {
    phase,
    score,
    coins,
    dashMeter,
    plane,
    muted,
    genesisMs,
    chronoMs,
    hasRecovery,
    gameOver,
    highScore,
  };
}
