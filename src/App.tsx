import { GameCanvas } from './react/components/GameCanvas';
import { HUD } from './react/components/HUD';
import { MainMenu } from './react/components/MainMenu';
import { GameOverScreen } from './react/components/GameOverScreen';
import { TransactionStatus } from './react/components/TransactionStatus';
import { useGameState } from './react/hooks/useGameState';
import {
  requestMainMenu,
  requestRestart,
  requestStart,
  requestToggleMute,
} from './game/GameController';

export default function App() {
  const {
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
  } = useGameState();

  return (
    <div className="app-shell">
      <div className="game-frame">
        <GameCanvas />
        <TransactionStatus />
        <HUD
          phase={phase}
          score={score}
          coins={coins}
          highScore={highScore}
          dashMeter={dashMeter}
          plane={plane}
          genesisMs={genesisMs}
          chronoMs={chronoMs}
          hasRecovery={hasRecovery}
        />
        <button
          className="mute-btn"
          onClick={requestToggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          title={muted ? 'Unmute (M)' : 'Mute (M)'}
        >
          {muted ? '🔇' : '🔊'}
        </button>
        {phase === 'menu' && (
          <MainMenu highScore={highScore} onPlay={requestStart} />
        )}
        {phase === 'over' && gameOver && (
          <GameOverScreen
            data={gameOver}
            highScore={highScore}
            onPlayAgain={requestRestart}
            onMainMenu={requestMainMenu}
          />
        )}
      </div>
    </div>
  );
}
