# Contributing to Hemi Shadow Runner

Thank you for your interest in contributing to Hemi Shadow Runner! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)
- MetaMask or compatible Web3 wallet (for testing Web3 features)

### Setting Up Development Environment

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/hemi-shadow-runner.git
   cd hemi-shadow-runner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 📋 Code Standards

### TypeScript

- Use TypeScript for all new files
- Avoid `any` types - use proper type definitions
- Export types/interfaces that other modules might need
- Document complex types with JSDoc comments

### Code Style

- Use **Oxlint** for linting: `npm run lint`
- Follow existing code patterns in the project
- Use meaningful variable and function names
- Keep functions focused and modular

### Naming Conventions

- **Files**: PascalCase for components/classes (`GameScene.ts`), camelCase for utilities
- **Components**: PascalCase (`MainMenu.tsx`)
- **Functions**: camelCase (`requestStart()`)
- **Constants**: SCREAMING_SNAKE_CASE (`PLAYER.JUMP_VELOCITY`)
- **Types/Interfaces**: PascalCase (`WalletState`, `GameOverPayload`)

## 🎮 Architecture Guidelines

### Game Systems

New game systems should:
1. Live in `src/game/systems/`
2. Be self-contained and modular
3. Expose a clear public API
4. Store configuration in `GameConfig.ts`

Example:
```typescript
export class MyNewSystem {
  constructor(private scene: Phaser.Scene) {}
  
  update(delta: number): void {
    // System logic
  }
  
  reset(): void {
    // Clean up state
  }
}
```

### React Components

- Keep components focused on presentation
- Game logic stays in Phaser, not React
- Use hooks for state management
- Emit events via EventBus for cross-boundary communication

### Configuration

- All tunable values go in `src/game/config/GameConfig.ts`
- Use TypeScript `const` assertions for config objects
- Document what each value affects
- Group related values together

## 🔄 Development Workflow

### Branch Naming

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Commit Messages

Use clear, descriptive commit messages:
```
feat: add new power-up type
fix: prevent double-jump on coin collection
docs: update installation instructions
refactor: extract collision logic to separate system
```

### Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**
   - Write clean, documented code
   - Test thoroughly
   - Update documentation if needed

3. **Lint your code**
   ```bash
   npm run lint
   ```

4. **Build and test**
   ```bash
   npm run build
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add my new feature"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/my-new-feature
   ```

7. **Open a Pull Request**
   - Provide a clear description of changes
   - Link any related issues
   - Include screenshots/videos for visual changes

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, verify:
- [ ] Game starts and runs without errors
- [ ] All controls work (jump, dash, phase)
- [ ] Collisions detect correctly
- [ ] Power-ups spawn and function properly
- [ ] Score tracking is accurate
- [ ] Game over screen appears correctly
- [ ] Wallet connection works (testnet)
- [ ] Score signing works (if applicable)
- [ ] Build completes without errors
- [ ] No console errors in browser

### Testing Specific Features

**Power-ups**: Use the browser console to force-spawn power-ups:
```javascript
window.__game.scene.scenes[1].debugSpawnPowerUp('genesis')
window.__game.scene.scenes[1].debugSpawnPowerUp('chrono')
window.__game.scene.scenes[1].debugSpawnPowerUp('recovery')
```

**Web3**: Test with Hemi Sepolia testnet. Get testnet ETH from [Hemi Discord](https://discord.gg/hemixyz)

## 📝 Documentation

When adding features:
- Update README.md if user-facing
- Add JSDoc comments to complex functions
- Update GameConfig.ts comments for new tunables
- Create architecture docs for major systems

## 🐛 Bug Reports

### Before Submitting

1. Check existing issues to avoid duplicates
2. Test with the latest code
3. Try to reproduce consistently

### Bug Report Template

```markdown
**Description**
A clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Node version: [e.g., 18.17.0]
```

## 💡 Feature Requests

We welcome feature ideas! When proposing a feature:
- Explain the use case
- Describe the expected behavior
- Consider how it fits with existing mechanics
- Mock up UI changes if applicable

## 🎨 Design Philosophy

When contributing, keep these principles in mind:

1. **Responsive Controls**: Input should feel immediate and forgiving
2. **Clear Feedback**: Visual/audio cues for all player actions
3. **Progressive Difficulty**: Challenge increases naturally over time
4. **Minimal Dependencies**: Prefer built-in APIs over heavy libraries
5. **Clean Architecture**: Maintain separation between React UI and Phaser game logic

## 📦 Adding Dependencies

Before adding a new dependency:
1. Verify it's truly needed
2. Check bundle size impact
3. Ensure it's actively maintained
4. Discuss in an issue first for major additions

## 🔐 Security

- Never commit private keys or secrets
- Test Web3 features on testnet first
- Validate all user inputs
- Follow secure coding practices

## 📞 Getting Help

- Open an issue for bugs or questions
- Join [Hemi Discord](https://discord.gg/hemixyz) for community discussion
- Check existing documentation first

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Hemi Shadow Runner!** 🎮✨
