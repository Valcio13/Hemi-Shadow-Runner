# How to Create Media for GitHub

Quick guide to create screenshots, GIFs, and videos for the README.

## 🎯 What You Need

### Priority Media (Most Important)
1. **gameplay.gif** - 10-15 second gameplay loop showing:
   - Running and jumping
   - Phase shifting between planes
   - Collecting coins
   - Avoiding obstacles

2. **leaderboard.png** - Screenshot of the leaderboard showing:
   - Top players
   - Ranks and scores
   - Your position (if on leaderboard)

3. **player-stats.png** - Your player statistics panel showing:
   - Games played
   - Total score
   - Best score
   - Achievements

### Optional Media (Nice to Have)
4. **phase-shift.gif** - Short clip showing the dual-plane mechanic
5. **dash-system.gif** - Dash activation and effect
6. **power-ups.gif** - Power-ups being collected and used
7. **wallet-connect.png** - MetaMask connection flow

---

## 🛠️ Tools for Windows

### For Screenshots
1. **Built-in Windows Snipping Tool**
   - Press `Win + Shift + S`
   - Select area
   - Screenshot saved to clipboard
   - Paste into Paint or image editor

2. **Browser DevTools** (Best for consistent sizing)
   - Open game in browser
   - Press `F12` to open DevTools
   - Press `Ctrl + Shift + P`
   - Type "screenshot" → Choose "Capture screenshot"

### For GIFs/Recording
1. **ScreenToGif** (Free, Best Option) ⭐
   - Download: https://www.screentogif.com/
   - Click "Recorder"
   - Select game window
   - Record 10-15 seconds
   - Click "Stop" → "Editor" opens
   - Trim, optimize, save as GIF

2. **Xbox Game Bar** (Built-in Windows)
   - Press `Win + G` to open
   - Click "Capture" button
   - Record video
   - Convert to GIF later using online tools

3. **OBS Studio** (Advanced)
   - Download: https://obsproject.com/
   - More powerful but more complex

---

## 📝 Step-by-Step: Creating Gameplay GIF

### Using ScreenToGif (Recommended)

1. **Download & Install ScreenToGif**
   - Get it from https://www.screentogif.com/
   - No signup required, totally free

2. **Prepare the Game**
   - Open https://hemi-shadow-runner.pages.dev
   - Set browser to 1280x720 or similar
   - Press `F11` for fullscreen (optional)
   - Start playing but don't record yet

3. **Start Recording**
   - Open ScreenToGif
   - Click "Recorder"
   - Position the recording frame around game window
   - Click "Record" button (red circle)
   - **Now play the game for 10-15 seconds**
   - Show off:
     - Jumping over obstacles
     - Phase shifting (press Shift)
     - Collecting coins
     - Using dash (press E)
     - Maybe get a power-up!

4. **Stop & Edit**
   - Click "Stop" in ScreenToGif
   - Editor window opens automatically
   - **Trim the footage**:
     - Remove first few frames (loading/starting)
     - Remove last few frames (stopping)
     - Keep only the good gameplay
   - **Optimize**:
     - Click "Reduce Framerate" → Set to 15 FPS (good balance)
     - Click "Delete" → "Duplicates" (removes similar frames)

5. **Save**
   - Click "Save As" → GIF
   - Choose quality: "High" or "Very High"
   - Save to `.github/media/gameplay.gif`
   - **Check file size**: Should be < 5MB for GitHub

---

## 📸 Step-by-Step: Screenshots

### Leaderboard Screenshot

1. Open game in browser
2. Click "Leaderboard" button
3. Wait for it to load
4. Press `F12` → Open DevTools
5. Press `Ctrl + Shift + P`
6. Type "screenshot" → "Capture screenshot"
7. Save as `.github/media/leaderboard.png`

### Player Stats Screenshot

1. Open game, connect wallet
2. Click "Your Stats" button
3. Let stats load
4. Take screenshot same way as above
5. Save as `.github/media/player-stats.png`

---

## 🎨 Optimization Tips

### Reduce GIF Size
If your GIF is too large (> 5MB):

1. **Lower framerate**: 10-15 FPS is fine for gameplay
2. **Reduce resolution**: 1280x720 instead of 1920x1080
3. **Shorten duration**: 10 seconds max
4. **Use online optimizer**: 
   - https://ezgif.com/optimize
   - Upload your GIF
   - Set compression level
   - Download optimized version

### Compress Images
For PNG screenshots:

1. Use TinyPNG: https://tinypng.com/
2. Upload your screenshot
3. Download compressed version
4. Saves 50-70% file size with no visible quality loss

---

## 📤 Adding to Repository

Once you have the media files:

```bash
# Add the files
git add .github/media/gameplay.gif
git add .github/media/leaderboard.png
git add .github/media/player-stats.png

# Commit
git commit -m "docs: Add screenshots and gameplay GIF"

# Push
git push
```

Then edit `README.md` and uncomment the media sections (remove the `<!--` and `-->`).

---

## ✅ Checklist

Before creating media:
- [ ] Game is running on latest version
- [ ] Browser zoom is at 100%
- [ ] Good gameplay moment captured (not dying/failing)
- [ ] UI is visible and clear
- [ ] File sizes are reasonable (< 5MB for GIFs)

After creating media:
- [ ] Files are in `.github/media/` directory
- [ ] Files are properly named
- [ ] Files are optimized (compressed)
- [ ] README.md is updated to uncomment media
- [ ] Committed and pushed to GitHub

---

## 🎬 Example Good Gameplay Clip

A good 10-second gameplay GIF should show:
1. **0-3s**: Running, jumping over 1-2 obstacles
2. **3-5s**: Phase shift to pass through barrier
3. **5-7s**: Collect some coins
4. **7-10s**: Use dash or grab a power-up

**Show variety and action!** Don't just run in a straight line.

---

## 🆘 Need Help?

If you get stuck:
1. Check the file names match exactly
2. Make sure files are in `.github/media/` directory
3. Verify file sizes are reasonable
4. Test that images display locally first

---

Good luck! Your README will look amazing with visuals! 🎉
