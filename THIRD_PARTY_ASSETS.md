# Third-Party Assets - Hemi Shadow Runner

This document lists all third-party assets and libraries used in the Hemi Shadow Runner project for contest submission purposes.

## Audio Assets

### Background Music
- **Asset**: "Gameotoon"
- **Author**: slimeyfox
- **Source**: [Pixabay](https://pixabay.com/music/happy-childrens-tunes-gameotoon-481311/)
- **License**: Pixabay Content License (Free for commercial use, no attribution required)
- **Usage**: Background music during gameplay

## Software Libraries & Frameworks

### Production Dependencies

#### Game Engine & Frontend
- **Phaser** v3.80.1 - MIT License
  - Purpose: HTML5 game engine for core gameplay
  - Source: https://phaser.io/

- **React** v18.3.1 - MIT License
  - Purpose: UI framework for menus and overlays
  - Source: https://react.dev/

- **React DOM** v18.3.1 - MIT License
  - Purpose: React rendering for web
  - Source: https://react.dev/

#### Blockchain Integration
- **ethers.js** v6.10.0 - MIT License
  - Purpose: Ethereum/Hemi network interaction
  - Source: https://docs.ethers.org/

### Development Dependencies

#### Smart Contract Development
- **Hardhat** v2.19.5 - MIT License
  - Purpose: Ethereum development environment
  - Source: https://hardhat.org/

- **OpenZeppelin Contracts** v5.0.1 - MIT License
  - Purpose: Secure smart contract libraries (Ownable, Pausable, ReentrancyGuard)
  - Source: https://www.openzeppelin.com/contracts

- **@nomicfoundation/hardhat-ethers** v3.0.5 - MIT License
  - Purpose: Hardhat plugin for ethers.js integration

- **@nomicfoundation/hardhat-toolbox** v5.0.0 - MIT License
  - Purpose: Hardhat plugins bundle

- **@nomicfoundation/hardhat-verify** v2.0.4 - MIT License
  - Purpose: Contract verification on block explorers

- **TypeChain** v8.3.2 - MIT License
  - Purpose: TypeScript bindings for smart contracts
  - Includes: @typechain/ethers-v6, @typechain/hardhat

#### Testing
- **Chai** v4.4.1 - MIT License
  - Purpose: Assertion library for contract tests
  - Source: https://www.chaijs.com/

- **@types/chai** v4.3.11 - MIT License
  - Purpose: TypeScript definitions for Chai

- **@types/mocha** v10.0.6 - MIT License
  - Purpose: TypeScript definitions for Mocha

- **hardhat-gas-reporter** v1.0.9 - MIT License
  - Purpose: Gas usage reporting for smart contracts

- **solidity-coverage** v0.8.5 - ISC License
  - Purpose: Code coverage for Solidity

#### Build Tools
- **Vite** v6.0.0 - MIT License
  - Purpose: Frontend build tool and dev server
  - Source: https://vitejs.dev/

- **@vitejs/plugin-react** v4.3.4 - MIT License
  - Purpose: React plugin for Vite

- **TypeScript** v5.5.3 - Apache 2.0 License
  - Purpose: Type system for JavaScript
  - Source: https://www.typescriptlang.org/

- **ts-node** v10.9.2 - MIT License
  - Purpose: TypeScript execution for Node.js

- **tsx** v4.23.11 - MIT License
  - Purpose: TypeScript execution and watch mode

#### Utilities
- **dotenv** v16.4.1 - BSD-2-Clause License
  - Purpose: Environment variable management
  - Source: https://github.com/motdotla/dotenv

- **oxlint** v1.14.0 - MIT License
  - Purpose: Fast JavaScript/TypeScript linter
  - Source: https://oxc-project.github.io/

#### TypeScript Type Definitions
- **@types/node** v20.14.0 - MIT License
- **@types/react** v18.3.3 - MIT License
- **@types/react-dom** v18.3.0 - MIT License

## Original Assets

### Graphics
All in-game graphics (player, obstacles, barriers, coins, power-ups, particles) are **100% procedurally generated** at runtime using:
- Phaser's Graphics API (built-in)
- Canvas 2D Context (browser native)
- No external image files or sprite sheets

### Sound Effects
All sound effects are **procedurally generated** at runtime using:
- Web Audio API (browser native)
- No external audio files (except background music listed above)

## License Summary

- **Project Code**: MIT License (see LICENSE file)
- **Third-Party Libraries**: Primarily MIT License, with Apache 2.0 (TypeScript), ISC (solidity-coverage), and BSD-2-Clause (dotenv)
- **Audio Assets**: Pixabay Content License (royalty-free)
- **Generated Assets**: Original work, part of project MIT License

## Compliance Notes

1. All dependencies are open-source with permissive licenses
2. No GPL or copyleft licenses that would restrict project licensing
3. Background music is used under Pixabay's royalty-free license
4. All procedurally generated assets are original work
5. Proper attribution provided in ATTRIBUTION.md

## Verification

All dependencies and their licenses can be verified via:
- npm: `npm list --all`
- Package files: `package.json` and `package-lock.json`
- License texts: Available in `node_modules/[package]/LICENSE` after `npm install`

---

*Last Updated: August 8, 2026*
*For detailed attribution and credits, see [ATTRIBUTION.md](ATTRIBUTION.md)*
