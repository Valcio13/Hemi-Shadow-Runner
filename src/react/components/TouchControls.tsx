/**
 * TouchControls - On-screen buttons for mobile gameplay
 * 
 * Provides touch-friendly controls for:
 * - Jump (tap anywhere or dedicated button)
 * - Phase Shift (toggle between light/shadow)
 * - Dash (when meter is full)
 */
import { useEffect, useState } from 'react';
import { requestDash, requestPhase } from '../../game/GameController';

interface TouchControlsProps {
  phase: 'boot' | 'menu' | 'playing' | 'over';
  dashReady: boolean;
  currentPlane: 'light' | 'shadow';
}

export function TouchControls({ phase, dashReady, currentPlane }: TouchControlsProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detect if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth < 768 
        || ('ontouchstart' in window);
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Only show during gameplay on mobile devices
  if (phase !== 'playing' || !isMobile) {
    return null;
  }

  const handlePhaseShift = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    requestPhase();
  };

  const handleDash = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dashReady) {
      requestDash();
    }
  };

  return (
    <div className="touch-controls">
      {/* Phase Shift Button - Left Side */}
      <button
        className={`touch-btn touch-btn-phase touch-btn-${currentPlane}`}
        onTouchStart={handlePhaseShift}
        onMouseDown={handlePhaseShift}
        aria-label="Phase Shift"
      >
        <div className="touch-btn-icon">⚡</div>
        <div className="touch-btn-label">SHIFT</div>
      </button>

      {/* Dash Button - Right Side */}
      <button
        className={`touch-btn touch-btn-dash ${dashReady ? 'ready' : 'disabled'}`}
        onTouchStart={handleDash}
        onMouseDown={handleDash}
        disabled={!dashReady}
        aria-label="Dash"
      >
        <div className="touch-btn-icon">💨</div>
        <div className="touch-btn-label">DASH</div>
      </button>

      {/* Jump Info - Center */}
      <div className="touch-jump-hint">
        Tap screen to jump
      </div>
    </div>
  );
}
