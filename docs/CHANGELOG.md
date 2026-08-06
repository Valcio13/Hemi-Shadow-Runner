# Changelog

All notable changes to Hemi Shadow Runner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-01-XX

### 🎮 Initial Release

The first playable version of Hemi Shadow Runner featuring core gameplay mechanics and blockchain integration.

#### Added

**Core Gameplay**
- Endless runner mechanics with responsive jump controls
- Dual-plane shadow system with phase toggle (SHIFT/F)
- Dash system with meter charging via coin collection
- Obstacle spawning with difficulty scaling
- Coin collection with score rewards
- Plane-locked barriers requiring phase to pass
- High score tracking with localStorage persistence

**Controls**
- Jump with SPACE, UP arrow, W, or left-click
- Phase between planes with SHIFT, F, or right-click
- Dash with E key (when meter is full)
- Mute toggle with M key
- Responsive touch/mouse controls

**Power-ups**
- Genesis Shard: 2× score multiplier (10s duration)
- Chrono Fragment: World time slowdown (3.5s duration)
- Recovery Protocol: Extra life with invulnerability window

**Visual & Audio**
- Procedurally generated graphics (TextureFactory)
- Procedurally synthesized audio (Web Audio API)
- Squash & stretch player animation
- Landing dust particle effects
- Camera shake on impact
- Plane-specific color schemes
- Parallax scrolling backgrounds (stars, mountains)
- Dash trail afterimages

**UI Components**
- Main menu with attract mode
- In-game HUD showing score, coins, dash meter, plane indicator
- Power-up status indicators
- Game over screen with score breakdown
- High score display
- Mute button

**Web3 Integration**
- Wallet connection via MetaMask (EIP-1193)
- Hemi Sepolia testnet support (default)
- Hemi Mainnet configuration (ready to enable)
- Automatic chain switching
- Gasless score attestation via personal_sign
- Score signature with timestamp and player address
- Error handling for wallet interactions

**Developer Experience**
- TypeScript throughout
- React 18 + Phaser 3.80 architecture
- Clean React ↔ Phaser bridge pattern (EventBus + GameController)
- Modular system design
- Centralized configuration (GameConfig.ts, Web3Config.ts)
- Vite for fast builds
- Oxlint for linting
- Comprehensive code documentation

**Game Feel Improvements**
- Coyote time (90ms grace window after leaving ground)
- Jump buffering (110ms buffer before landing)
- Coin hop mechanic (mid-air bounce on collection)
- Frame-time clamping to prevent teleport deaths
- Object pooling for performance
- Invincibility during dash and post-revive

**Configuration**
- All gameplay values in GameConfig.ts
- Network settings in Web3Config.ts
- Mute state persistence
- High score persistence

### Technical Details

**Bundle Size**
- Total: ~450KB (uncompressed)
- Zero image assets (all procedural)
- Zero audio assets (all synthesized)
- No heavy Web3 libraries

**Performance**
- Steady 60fps on modern devices
- Frame-time safety via delta clamping
- Efficient collision detection
- Object pooling for all game entities

**Browser Support**
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers with touch support

**Blockchain**
- Hemi Sepolia testnet (default)
- Hemi Mainnet ready
- Gasless attestation (no transaction fees)
- EIP-1193 provider support

### Known Issues

None reported in initial release.

---

## Future Roadmap (Potential Features)

### Planned for v0.2.0
- [ ] On-chain leaderboard contract
- [ ] Score verification backend
- [ ] Additional power-ups
- [ ] Sound volume controls
- [ ] Accessibility improvements

### Planned for v0.3.0
- [ ] Multiple playable characters
- [ ] Achievement system
- [ ] Daily challenges
- [ ] Replay system
- [ ] Mobile-optimized controls

### Planned for v1.0.0
- [ ] Multiplayer race mode
- [ ] NFT character skins
- [ ] Tournament mode
- [ ] Token rewards
- [ ] Complete leaderboard system

---

## Version History

### [0.1.0] - 2024-01-XX
Initial public release with core gameplay and Web3 integration.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for how to help improve Hemi Shadow Runner.

## License

[Add your license information here]
