# Player Stats Feature

## Overview
The Player Stats feature displays comprehensive player statistics fetched from the smart contract and leaderboard data. Players can view their performance metrics, recent games, and earned achievements.

## Implementation Summary

### Components Created

#### 1. `usePlayerStats` Hook
**Location**: `src/react/hooks/usePlayerStats.ts`

**Features**:
- Fetches on-chain player stats from smart contract (`bestScore`, `gamesPlayed`)
- Retrieves cumulative score and rank from leaderboard cache
- Queries recent game history from blockchain events (last 5 games)
- Auto-refreshes every 30 seconds
- Handles loading and error states

**Data Structure**:
```typescript
interface PlayerStats {
  bestScore: number;           // Best single game score (on-chain)
  gamesPlayed: number;          // Total games played (on-chain)
  cumulativeScore: number;      // Total of all scores (from leaderboard)
  rank: number | null;          // Player's leaderboard rank
  recentGames: Array<{          // Last 5 games from events
    sessionId: string;
    score: number;
    timestamp: number;
    txHash: string;
  }>;
  loading: boolean;
  error: string | null;
}
```

#### 2. `PlayerStats` Component
**Location**: `src/react/components/PlayerStats.tsx`

**Features**:
- **Wallet Validation**: Shows connection prompt if wallet not connected or on wrong network
- **Stats Grid**: Displays 4 key metrics in card layout:
  - Games Played
  - Total Score (highlighted, cumulative)
  - Best Game (best single score)
  - Average Score (calculated)
- **Recent Games**: Shows last 5 games with scores, timestamps, and transaction links
- **Achievements System**: Dynamic achievement badges based on performance:
  - 🎮 **First Blood** - Play your first game
  - 🔥 **Dedicated** - Play 10+ games
  - ⭐ **1K Club** - Score 1,000+ in a single game
  - 💎 **Elite Player** - Score 5,000+ in a single game
  - 👑 **Top 10** - Reach top 10 on leaderboard
  - 🏆 **Champion** - Rank #1 on leaderboard
- **Rank Badge**: Shows player's current leaderboard rank with emoji indicator
- **Empty State**: Friendly message when player has no games yet

### Integration

#### Main Menu Integration
**Location**: `src/react/components/MainMenu.tsx`

**Changes**:
1. Added import for `PlayerStats` component
2. Added `showStats` state management
3. Added conditional rendering when `showStats` is true
4. Added "📊 Your Stats" button in menu buttons section
5. Button only visible when wallet is connected and on correct network

**UI Flow**:
```
Main Menu
  ├─ 🏆 View Leaderboard (always visible)
  └─ 📊 Your Stats (only when connected to Hemi)
```

### Styling

**Location**: `src/styles/global.css`

**Added Styles**:
- `.menu-buttons` - Container for leaderboard and stats buttons
- `.btn-stats` - Stats button styling
- `.panel-stats` - Stats panel container with scrolling
- `.stats-player-info` - Player address and rank display
- `.stats-address-link` - Clickable address link to explorer
- `.stats-rank-badge` - Rank indicator badge
- `.stats-grid` - 2-column grid for stat cards
- `.stat-card` - Individual stat display card
- `.stat-highlight` - Highlighted card (total score)
- `.stats-recent` - Recent games list
- `.stats-game-row` - Individual game entry
- `.stats-achievements` - Achievement grid
- `.achievement` - Individual achievement badge
- Scrollbar styling for overflow content

## User Experience

### Access Flow
1. Player connects wallet on main menu
2. "📊 Your Stats" button appears below "🏆 View Leaderboard"
3. Click button to view full stats modal
4. Modal shows loading spinner while fetching data
5. Stats display with interactive elements (links to explorer)
6. Click "Close" or press ESC to return to menu

### Data Refresh
- Stats auto-refresh every 30 seconds while modal is open
- Fresh data loaded each time modal is opened
- Recent games fetched from last ~10,000 blocks

### Error Handling
- Shows "Connect Wallet" prompt if not connected
- Shows network warning if not on Hemi Sepolia
- Shows error message if contract calls fail
- Graceful fallback if leaderboard data unavailable

## Technical Details

### Contract Calls
- Uses `getPlayerStats(address)` to fetch on-chain stats
- Queries `GameFinished` events filtered by player address
- Uses JSON RPC provider (no signing required)

### Performance Considerations
- Leaderboard fetched from static JSON file (fast)
- Event queries limited to last 10,000 blocks
- Only last 5 games displayed
- Data cached per component instance
- Auto-refresh interval can be adjusted

### Dependencies
- `ethers` v6 for contract interaction
- `useWallet` hook for wallet state
- `Web3Config` for chain and contract configuration
- `game-types` for contract ABI

## Future Enhancements

Potential additions:
- [ ] Score history graph/chart
- [ ] Compare stats with other players
- [ ] Weekly/monthly leaderboard positions
- [ ] Achievement sharing to social media
- [ ] Personal best tracking per time period
- [ ] Export stats as image or PDF
- [ ] Streak tracking (consecutive days played)
- [ ] Session duration statistics

## Testing Checklist

- [x] Stats display correctly for connected wallet
- [x] Shows wallet connection prompt when disconnected
- [x] Shows network warning when on wrong chain
- [x] Recent games display with correct timestamps
- [x] Transaction links navigate to correct explorer page
- [x] Achievements unlock at correct thresholds
- [x] Rank badge shows correct position
- [x] Loading state displays while fetching
- [x] Error state displays on fetch failure
- [x] Empty state displays for new players
- [x] Modal closes properly
- [x] Stats auto-refresh works
- [x] Responsive layout on different screen sizes

## Related Files

- `src/react/hooks/usePlayerStats.ts` - Stats fetching logic
- `src/react/components/PlayerStats.tsx` - Stats display component
- `src/react/components/MainMenu.tsx` - Main menu integration
- `src/styles/global.css` - Component styling
- `src/contracts/game-types.ts` - Contract ABI definitions
- `src/game/config/Web3Config.ts` - Chain and contract config

## Contract Integration

**Contract**: `ShadowRunnerGame`  
**Address**: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`  
**Network**: Hemi Sepolia (743111)

**Used Functions**:
- `getPlayerStats(address)` → `(uint16 bestScore, uint16 gamesPlayed)`

**Used Events**:
- `GameFinished(uint256 indexed sessionId, address indexed player, uint16 score, uint16 gamesPlayed)`

## Documentation

Full player stats documentation: `docs/PLAYER_STATS_FEATURE.md` (this file)
