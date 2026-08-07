# Leaderboard Update Fix

## Problem

The leaderboard and player stats were not updating on the live site because:

1. **GitHub Actions lacked permissions** - The workflow couldn't push updated leaderboard data back to the repository
2. **Local leaderboard was outdated** - The `public/leaderboard.json` hadn't been refreshed since deployment

## What Was Fixed

### 1. Added GitHub Actions Permissions
Updated `.github/workflows/update-leaderboard.yml` to include:
```yaml
permissions:
  contents: write # Allow workflow to commit and push changes
```

This allows the automated workflow to:
- Fetch new game events from the blockchain every 10 minutes
- Update `public/leaderboard.json` with latest scores
- Commit and push changes back to the repository
- Trigger Cloudflare Pages to redeploy with updated data

### 2. Updated Leaderboard Data
Ran `npm run leaderboard:fetch` locally to index the latest games:
- **Before:** 2 games, 5,432 total score (last updated at block 6493348)
- **After:** 4 games, 14,653 total score (updated to block 6499407)

## How It Works Now

### Automatic Updates (Every 10 Minutes)
GitHub Actions workflow automatically:
1. Fetches latest `GameFinished` events from blockchain
2. Updates cumulative scores and rankings
3. Commits changes to repository
4. Cloudflare Pages auto-deploys the update

### Manual Updates (If Needed)
You can manually trigger an update:

**Option 1: GitHub UI**
- Go to Actions tab → "Update Leaderboard" workflow → "Run workflow"

**Option 2: Local Script**
```bash
npm run leaderboard:fetch
git add public/leaderboard.json
git commit -m "chore: Update leaderboard"
git push
```

## Verification

After the fix is deployed:

1. **Wait ~1 minute** for Cloudflare Pages to rebuild
2. **Hard refresh** the game page (Ctrl+Shift+R / Cmd+Shift+R)
3. **Check leaderboard** - should show:
   - 4 games played
   - 14,653 total score
   - Updated "Last Played" timestamp

## Player Stats Update

Player stats (`📊 Your Stats` button) also refresh automatically because they:
- Fetch on-chain data from smart contract (always current)
- Load rankings from `public/leaderboard.json` (now auto-updates)
- Refresh every 30 seconds while the panel is open

## Files Modified

- `.github/workflows/update-leaderboard.yml` - Added write permissions
- `public/leaderboard.json` - Updated with latest game data
- `leaderboard-cache.json` - Local cache (gitignored, not committed)

## Next Game Session

When you play again:
- Score submits to blockchain immediately ✅
- GitHub Actions picks it up within 10 minutes ✅
- Leaderboard updates automatically ✅
- Player stats reflect new game ✅

Everything should now update automatically! 🎮🏆
