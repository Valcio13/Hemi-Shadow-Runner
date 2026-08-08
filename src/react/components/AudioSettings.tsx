/**
 * AudioSettings - Volume controls for music and sound effects
 * 
 * Allows players to adjust:
 * - Background music volume
 * - Sound effects volume
 * - Master mute toggle
 */
import { useState, useEffect } from 'react';
import { EventBus, GameEvents } from '../../game/EventBus';

interface AudioSettingsProps {
  onClose: () => void;
}

export function AudioSettings({ onClose }: AudioSettingsProps) {
  const [musicVolume, setMusicVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(100);
  const [muted, setMuted] = useState(false);

  // Load saved volumes from localStorage
  useEffect(() => {
    const savedMusic = localStorage.getItem('music-volume');
    const savedSfx = localStorage.getItem('sfx-volume');
    const savedMute = localStorage.getItem('audio-mute') === '1';

    if (savedMusic) setMusicVolume(parseInt(savedMusic));
    if (savedSfx) setSfxVolume(parseInt(savedSfx));
    setMuted(savedMute);
  }, []);

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    localStorage.setItem('music-volume', value.toString());
    EventBus.emit(GameEvents.MUSIC_VOLUME_CHANGED, value / 100);
  };

  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value);
    localStorage.setItem('sfx-volume', value.toString());
    EventBus.emit(GameEvents.SFX_VOLUME_CHANGED, value / 100);
  };

  const handleMuteToggle = () => {
    const newMuted = !muted;
    setMuted(newMuted);
    localStorage.setItem('audio-mute', newMuted ? '1' : '0');
    EventBus.emit(GameEvents.AUDIO_MUTE_CHANGED, newMuted);
  };

  return (
    <div className="overlay">
      <div className="panel panel-audio-settings">
        <div className="panel-header">
          <h1 className="panel-title">🔊 Audio Settings</h1>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="audio-settings-content">
          {/* Master Mute */}
          <div className="audio-setting-row">
            <label className="audio-setting-label">
              Master Audio
            </label>
            <button 
              className={`audio-mute-toggle ${muted ? 'muted' : ''}`}
              onClick={handleMuteToggle}
            >
              {muted ? '🔇 Muted' : '🔊 Enabled'}
            </button>
          </div>

          {/* Music Volume */}
          <div className="audio-setting-row">
            <label htmlFor="music-volume" className="audio-setting-label">
              🎵 Music Volume
            </label>
            <div className="audio-slider-container">
              <input
                id="music-volume"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => handleMusicVolumeChange(parseInt(e.target.value))}
                className="audio-slider"
                disabled={muted}
              />
              <span className="audio-volume-value">{musicVolume}%</span>
            </div>
          </div>

          {/* SFX Volume */}
          <div className="audio-setting-row">
            <label htmlFor="sfx-volume" className="audio-setting-label">
              🎮 Sound Effects
            </label>
            <div className="audio-slider-container">
              <input
                id="sfx-volume"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => handleSfxVolumeChange(parseInt(e.target.value))}
                className="audio-slider"
                disabled={muted}
              />
              <span className="audio-volume-value">{sfxVolume}%</span>
            </div>
          </div>

          {/* Info */}
          <div className="audio-settings-info">
            💡 Tip: Adjust volumes to your preference. Settings are saved automatically.
          </div>
        </div>

        <div className="panel-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
