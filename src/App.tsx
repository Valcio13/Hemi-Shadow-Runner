import { GameCanvas } from './react/components/GameCanvas';
import { HUD } from './react/components/HUD';
import { MainMenu } from './react/components/MainMenu';
import { GameOverScreen } from './react/components/GameOverScreen';
import { TransactionStatus } from './react/components/TransactionStatus';
import { ChallengeBanner } from './react/components/ChallengeBanner';
import { TouchControls } from './react/components/TouchControls';
import { useGameState } from './react/hooks/useGameState';
import { useChallenge } from './react/hooks/useChallenge';
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

  const { challenge, checkScore, clearChallenge } = useChallenge();

  // Check challenge when game is over
  if (phase === 'over' && gameOver && challenge.active && !challenge.beaten) {
    checkScore(gameOver.score);
  }

  const handleMainMenu = () => {
    clearChallenge();
    requestMainMenu();
  };

  return (
    <div className="app-shell">
      <div className="game-frame">
        <GameCanvas />
        <TransactionStatus />
        <TouchControls 
          phase={phase} 
          dashReady={dashMeter >= 100} 
          currentPlane={plane}
        />
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
        {/* Challenge Banner - show during gameplay */}
        {phase === 'playing' && challenge.active && (
          <ChallengeBanner 
            targetScore={challenge.targetScore} 
            currentScore={score} 
            challengerAddress={challenge.challengerAddress}
          />
        )}
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
            onMainMenu={handleMainMenu}
            challengeScore={challenge.active ? challenge.targetScore : undefined}
            beatChallenge={challenge.active ? challenge.beaten : undefined}
          />
        )}
      </div>
    </div>
  );
}
