# Social Features Testing Guide

## How to Test Social Features

### **Testing Share Functionality**

1. **Play a game** and finish it
2. On Game Over screen, click **"🎉 Share Score"**
3. You should see the Share Score modal with:
   - Your score displayed prominently
   - Number of coins collected
   - Session ID (if you played with wallet)
   - Transaction link (if score was submitted on-chain)

4. **Test each share option**:

#### Twitter/X Share:
- Click **"𝕏 Share on X (Twitter)"** button
- Should open Twitter with pre-filled text:
  ```
  🎮 I just scored [YOUR_SCORE] points in Shadow Runner on @hemi_xyz!
  
  🪙 Collected [COINS] coins
  ⚡ Phase-shifting through light and shadow
  
  Think you can beat my score? 👀
  
  https://your-site.pages.dev?challenge=[YOUR_SCORE]
  
  ✅ Verified on-chain: https://testnet.explorer.hemi.xyz/tx/[TX_HASH]
  ```

#### Copy Share Text:
- Click **"📋 Copy Share Text"** button
- Button should change to show checkmark: **"✓ Copied!"**
- Paste in a text editor to verify the full formatted text was copied

#### Copy Challenge Link:
- Click **"⚔️ Copy Challenge Link"** button
- Button should change to show checkmark: **"✓ Copied!"**
- Should copy: `https://your-site.pages.dev?challenge=[YOUR_SCORE]`

---

### **Testing Challenge Mode**

#### Create a Challenge:
1. Play a game and get a score (e.g., 1234)
2. Click "🎉 Share Score"
3. Click "⚔️ Copy Challenge Link"
4. You now have: `https://your-site.pages.dev?challenge=1234`

#### Accept a Challenge:
1. **Open challenge link** in browser (or new tab)
2. **Main menu should show** normally
3. **Click "PLAY"** to start the game
4. **During gameplay**, you should see:
   - **Challenge banner** at top-center of screen
   - Shows: "CHALLENGE MODE" label
   - Shows: "Target: 1234" (the challenge score)
   - Shows: Progress ("X to go" or "BEATING IT!")
   - Progress bar at bottom of banner

5. **While playing**:
   - Banner updates in real-time as your score increases
   - When you pass the target score:
     - Banner turns green
     - Shows "🔥 BEATING IT!" message
     - Animated pulse effect

6. **On game over**:
   - If you **beat** the challenge:
     - Shows trophy: 🏆
     - "Challenge Completed!"
     - "You beat the target of 1234 by X points!"
   - If you **didn't beat** it:
     - Shows: 💪
     - "So Close!"
     - "Target: 1234 • You scored: X"

---

## Troubleshooting

### Issue: Challenge Link Generates as "localhost"

**Problem**: URL shows `http://localhost:5173?challenge=1234` instead of your live URL.

**Cause**: Testing in development mode (`npm run dev`).

**Solution**: 
- Challenge links will automatically use the correct domain when accessed on the live site
- When testing locally, the link will be localhost (expected behavior)
- Once deployed, links will use your Cloudflare Pages URL

### Issue: Challenge Banner Doesn't Appear

**Checklist**:
1. ✅ Did you open a URL with `?challenge=SCORE` parameter?
2. ✅ Is the challenge score a valid number?
3. ✅ Did you click "PLAY" to start the game?
4. ✅ Check browser console for errors (F12)

**Debug**:
```javascript
// Open browser console (F12) and check:
console.log(window.location.search); // Should show: ?challenge=1234
```

### Issue: Share Button Not Appearing

**Checklist**:
1. ✅ Did you finish a game (not exit mid-game)?
2. ✅ Is the Game Over screen showing?
3. ✅ Look for button labeled "🎉 Share Score"

### Issue: Twitter Share Not Opening

**Possible causes**:
- Pop-up blocker preventing new window
- Browser security settings
- AdBlocker interference

**Solution**:
- Allow pop-ups for your site
- Try in incognito/private mode
- Disable ad blockers temporarily

### Issue: Copy to Clipboard Not Working

**Possible causes**:
- Browser doesn't support Clipboard API
- Site not served over HTTPS (localhost or production needed)
- Browser permissions not granted

**Solution**:
- Make sure you're on HTTPS (Cloudflare Pages provides this automatically)
- Grant clipboard permissions when browser prompts
- Try in a different browser (Chrome, Firefox, Edge all support this)

---

## Expected Behavior Summary

### Share Flow:
```
Game Over → Click "🎉 Share Score" → Share Modal Opens
  ├─ Click Twitter → Opens pre-filled tweet
  ├─ Click Copy Text → Formatted text in clipboard
  └─ Click Challenge Link → URL in clipboard
```

### Challenge Flow:
```
Friend shares: https://site.com?challenge=1234
  ↓
You click link → Main menu loads
  ↓
Click PLAY → Challenge banner appears
  ↓
Play game → Banner shows progress
  ↓
Game over → Challenge result shown (won/lost)
```

---

## Testing on Live Site

**Your Live URL**: Check your Cloudflare Pages deployment for the exact URL

**Test Steps**:
1. Visit your live site
2. Play a game
3. Share score and copy challenge link
4. **Open challenge link in a new tab/incognito window**
5. Play the challenge
6. Verify banner and result display correctly

---

## Known Limitations

- Challenge parameter stays in URL until you return to main menu
- No challenge expiration (challenge links work forever)
- Challenge is client-side only (not validated on-chain)
- Maximum score that can be challenged: 65,535 (uint16 limit)

---

## Feature Verification Checklist

Before announcing:
- [ ] Share Score button appears on game over
- [ ] Twitter share opens with correct text
- [ ] Copy text works and includes all info
- [ ] Challenge link copies correct URL (with your domain)
- [ ] Challenge banner appears when opening challenge link
- [ ] Banner updates during gameplay
- [ ] Banner turns green when beating challenge
- [ ] Game over shows correct challenge result
- [ ] Transaction links work (if wallet connected)
- [ ] All features work on mobile (if applicable)

---

## Need Help?

If you encounter issues not covered here:
1. Check browser console (F12) for errors
2. Try in incognito/private mode
3. Test in different browser
4. Verify you're on the live site (not localhost)
5. Check that JavaScript is enabled
