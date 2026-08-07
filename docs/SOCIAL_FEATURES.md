# Social Features - Share & Challenge

## Overview
The social features system enables players to share their scores on social media and challenge friends to beat their scores. The system includes score sharing, challenge links, and in-game challenge mode.

## Implementation Summary

### Components Created

#### 1. `ShareScore` Component
**Location**: `src/react/components/ShareScore.tsx`

**Features**:
- **Score Card Display**: Shows score, coins, session ID, and on-chain proof
- **Multiple Share Options**:
  - 🐦 Share on X (Twitter) - Opens Twitter intent with pre-filled text
  - 📋 Copy Share Text - Copies formatted share text to clipboard
  - ⚔️ Copy Challenge Link - Copies challenge URL to clipboard
- **Challenge Link Generation**: Creates shareable URL with target score (`?challenge=1234`)
- **On-Chain Verification**: Links to Hemi Explorer transaction when available
- **Share Preview**: Shows formatted text preview before sharing

**Share Text Format**:
```
🎮 I just scored 1,234 points in Shadow Runner on @hemi_xyz!

🪙 Collected 50 coins
⚡ Phase-shifting through light and shadow

Think you can beat my score? 👀

🔗 Challenge link: https://yoursite.com?challenge=1234

✅ Proof: https://testnet.explorer.hemi.xyz/tx/0x...
```

#### 2. `useChallenge` Hook
**Location**: `src/react/hooks/useChallenge.ts`

**Features**:
- **URL Parameter Parsing**: Extracts `?challenge=score` from URL on load
- **Challenge State Management**: Tracks active challenge, target score, beaten status
- **Score Checking**: Compares player score against challenge target
- **Challenge Cleanup**: Clears challenge state and URL parameter

**State Interface**:
```typescript
interface ChallengeState {
  active: boolean;        // Is there an active challenge?
  targetScore: number;    // Score to beat
  beaten: boolean;        // Has player beaten the challenge?
  difference: number;     // Points above/below target
}
```

**Methods**:
- `checkScore(playerScore)` - Compare score against target
- `clearChallenge()` - Reset challenge state and clean URL

#### 3. `ChallengeBanner` Component
**Location**: `src/react/components/ChallengeBanner.tsx`

**Features**:
- **In-Game Display**: Shows during gameplay when in challenge mode
- **Live Progress**: Real-time comparison of current vs target score
- **Dynamic Styling**: Changes appearance when beating the challenge
- **Progress Bar**: Visual indicator of progress toward target
- **Motivational Feedback**: Shows "BEATING IT!" when surpassing target

**Display States**:
- **Chasing**: Red/orange gradient, shows points remaining
- **Winning**: Green gradient with animation, shows "BEATING IT!" message

#### 4. Challenge Result in GameOver
**Location**: `src/react/components/GameOverScreen.tsx` (updated)

**Features**:
- **Success State**: Shows trophy and congratulations when challenge beaten
- **Failure State**: Shows encouragement and how close they got
- **Score Comparison**: Displays target vs actual score
- **Visual Feedback**: Color-coded borders (green for success, orange for failure)

### Integration Points

#### App.tsx Integration
**Changes**:
1. Imported `useChallenge` hook and `ChallengeBanner` component
2. Added challenge state management
3. Added challenge banner display during gameplay
4. Pass challenge data to GameOverScreen
5. Clear challenge when returning to main menu

**Challenge Flow**:
```
URL with ?challenge=1234
  ↓
useChallenge extracts target score
  ↓
ChallengeBanner displays during gameplay
  ↓
checkScore() called on game over
  ↓
Challenge result shown in GameOverScreen
  ↓
clearChallenge() on return to menu
```

#### GameOverScreen Simplification
**Changes**:
1. Removed old attestation submission UI (no longer needed)
2. Score submission now happens automatically in GameScene
3. Added "🎉 Share Score" button
4. Added challenge result display
5. Shows transaction link if score was submitted on-chain
6. Simplified props to include sessionId and txHash

### Styling

**Location**: `src/styles/global.css`

**Added Styles**:

**Share Modal**:
- `.panel-share` - Share modal container
- `.share-score-card` - Score display card with gradient
- `.share-options` - Button container
- `.btn-twitter`, `.btn-copy`, `.btn-challenge` - Share action buttons
- `.share-challenge-info` - Challenge explanation section
- `.share-preview` - Share text preview area

**Challenge Banner**:
- `.challenge-banner` - In-game banner container
- `.challenge-passing` - Green state when beating challenge
- `.challenge-progress-bar` - Progress indicator
- Animated entrance and pulse effects

**Challenge Result**:
- `.challenge-result` - Result card in game over
- `.challenge-won` - Success styling (green)
- `.challenge-lost` - Encouragement styling (orange)

## User Flows

### Share Flow
1. Player finishes game
2. Game Over screen appears with "🎉 Share Score" button
3. Click button to open share modal
4. Choose share method:
   - **Twitter**: Opens Twitter with pre-filled tweet
   - **Copy Text**: Copies formatted text to clipboard
   - **Copy Link**: Copies challenge URL to clipboard
5. Share text includes:
   - Score and coins
   - Challenge link
   - On-chain proof (if available)
6. Close modal to return to game over screen

### Challenge Flow
1. Player A finishes game and shares challenge link
2. Player B clicks link (e.g., `https://game.com?challenge=1234`)
3. Game loads with challenge mode active
4. Challenge banner appears showing target score
5. During gameplay:
   - Banner shows progress toward target
   - Turns green and animates when beating target
6. On game over:
   - Shows challenge result (won/lost)
   - Displays score comparison
   - Enables sharing to challenge others

### Challenge URL Format
```
Base URL: https://your-game-domain.com
Challenge URL: https://your-game-domain.com?challenge=1234

Parameters:
- challenge: Target score to beat (number)
```

## Technical Details

### Score Submission Changes
**Previous**: Manual submission via button in GameOverScreen  
**Now**: Automatic submission in GameScene on death

**Benefits**:
- Immediate submission (no manual step)
- Less UI complexity in game over
- Score always recorded if wallet connected
- TransactionStatus shows real-time progress

### Challenge Parameter Persistence
- URL parameter stays in browser until cleared
- Allows page refresh without losing challenge
- Cleared manually when returning to main menu
- Can be shared directly from browser address bar

### Share Text Generation
```typescript
function generateShareText(score: number, coins: number): string {
  return `🎮 I just scored ${score.toLocaleString()} points in Shadow Runner on @hemi_xyz!

🪙 Collected ${coins} coins
⚡ Phase-shifting through light and shadow

Think you can beat my score? 👀`;
}
```

### Twitter Intent URL
```typescript
const twitterUrl = new URL('https://twitter.com/intent/tweet');
twitterUrl.searchParams.set('text', shareText + '\n\n' + challengeUrl);
twitterUrl.searchParams.set('hashtags', 'HemiNetwork,ShadowRunner,Web3Gaming');
```

## Social Platform Integration

### Twitter/X
- Uses Twitter Web Intent API
- Pre-fills tweet with score, challenge link, and proof
- Includes hashtags: #HemiNetwork, #ShadowRunner, #Web3Gaming
- Mentions @hemi_xyz official account

### Direct Sharing
- Copy to clipboard for sharing anywhere
- Works with Discord, Telegram, WhatsApp, etc.
- Plain text format for maximum compatibility

## Future Enhancements

Potential additions:
- [ ] Discord bot integration for automated challenges
- [ ] Leaderboard challenges (beat top 10)
- [ ] Friend system with direct challenges
- [ ] Challenge tournaments/brackets
- [ ] Share score as image/card (canvas rendering)
- [ ] Share to other platforms (Facebook, LinkedIn, Reddit)
- [ ] Challenge expiration/time limits
- [ ] Weekly/monthly challenge events
- [ ] Achievements for winning challenges
- [ ] Challenge history tracking
- [ ] Spectator mode for active challenges

## Testing Checklist

- [x] Share modal opens from game over screen
- [x] Twitter share opens with correct text
- [x] Copy share text works
- [x] Copy challenge link works
- [x] Challenge URL extracts score parameter correctly
- [x] Challenge banner displays during gameplay
- [x] Challenge banner updates as score changes
- [x] Challenge banner turns green when beating target
- [x] Challenge result shows correctly on game over (won/lost)
- [x] Challenge clears when returning to main menu
- [x] On-chain proof link works when available
- [x] Share preview displays formatted text
- [ ] Test with real Twitter account
- [ ] Test challenge flow with another player
- [ ] Test URL sharing via various platforms
- [ ] Test mobile responsiveness

## Analytics Opportunities

Track these metrics to understand social engagement:
- Share button clicks
- Twitter intent opens
- Copy to clipboard actions
- Challenge links created
- Challenge links visited
- Challenges completed
- Challenge success rate
- Most challenged scores
- Viral coefficient (shares per player)

## Security Considerations

### Challenge Links
- Challenge parameter is just a number (target score)
- No sensitive data in URL
- No authentication required
- Cannot be exploited for cheating
- Server-side validation still required for actual submissions

### Share Text
- All text is generated client-side
- No user input included (prevents XSS)
- URLs are properly encoded
- External links use `rel="noopener noreferrer"`

## Related Files

- `src/react/components/ShareScore.tsx` - Share modal component
- `src/react/components/ChallengeBanner.tsx` - In-game challenge display
- `src/react/hooks/useChallenge.ts` - Challenge state management
- `src/App.tsx` - Challenge system integration
- `src/react/components/GameOverScreen.tsx` - Updated game over screen
- `src/styles/global.css` - Social feature styling
- `src/game/systems/Web3System.ts` - Updated Attestation type

## Contract Integration

**Contract**: `ShadowRunnerGame`  
**Address**: `0xD2c7C67721F155424A24c148D15bCeba36F5dfEe`  
**Network**: Hemi Sepolia (743111)

**Score Submission**:
- Automatic submission in GameScene on player death
- Uses `submitScore(sessionId, score)` contract method
- Transaction hash available for sharing as proof

## Documentation

Full social features documentation: `docs/SOCIAL_FEATURES.md` (this file)
