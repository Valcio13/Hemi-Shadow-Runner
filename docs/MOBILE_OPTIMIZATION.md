# Mobile Optimization Guide

## Overview

ShadowRunner is fully optimized for mobile devices with touch controls, responsive UI, and mobile wallet support.

## Features

### 1. Touch Controls
- **On-screen buttons** for Phase Shift and Dash
- **Tap anywhere** on screen to jump
- **Auto-detection** of mobile devices
- **Landscape support** with adjusted button sizes
- **Safe area insets** for notched devices (iPhone X+)

### 2. Mobile Wallet Integration
- **Automatic detection** of mobile wallets
- **Deep link support** for MetaMask Mobile, Trust Wallet, Rainbow
- **Installation guidance** for users without wallets
- **Wallet selector UI** with installation status
- **In-app browser detection** for seamless connection

### 3. Responsive UI
- **Adaptive panel sizes** for small screens
- **Touch-friendly buttons** (min 44px touch targets)
- **Simplified leaderboard** (hides time/games columns on mobile)
- **Optimized HUD layout** with repositioned controls
- **Landscape mode support** with compact UI

### 4. Performance Optimizations
- **Efficient rendering** with Phaser 3 WebGL
- **Optimized asset loading**
- **Touch event optimization** (passive listeners)
- **Reduced animations** on low-power devices (future)

## Device Support

### Tested Devices
- ✅ iPhone (iOS 15+)
- ✅ Android phones (Chrome, Samsung Internet)
- ✅ iPad / Android tablets
- ✅ Landscape and portrait orientations

### Browser Support
- Chrome for Android (recommended)
- Safari on iOS (recommended)
- MetaMask Mobile in-app browser
- Trust Wallet in-app browser
- Other Web3-enabled mobile browsers

## Usage

### For Players

#### On Mobile:
1. **Install a Web3 wallet** (MetaMask, Trust Wallet, or Rainbow)
2. **Open the game** from your wallet's browser OR
3. **Visit the game URL** and tap "Connect Wallet" to see wallet options
4. **Play using touch controls**:
   - Tap screen to jump
   - Left button for phase shift
   - Right button for dash (when meter is full)

#### Desktop Browser:
- Use keyboard controls as normal
- Touch controls are hidden automatically

### For Developers

#### Testing Mobile Features Locally:
```bash
# Start dev server
npm run dev

# Access from mobile device on same network
# Find your local IP: ipconfig (Windows) or ifconfig (Mac/Linux)
# Visit: http://YOUR_IP:5173
```

#### Mobile Wallet Testing:
```typescript
// Check if mobile
import { MobileWalletHelper } from './game/systems/MobileWalletHelper';

if (MobileWalletHelper.isMobile()) {
  // Show mobile-specific UI
}

// Get available wallets
const wallets = MobileWalletHelper.getSupportedWallets();

// Open wallet via deep link
MobileWalletHelper.openMetaMaskMobile();
```

## Architecture

### Touch Control System
Location: `src/react/components/TouchControls.tsx`

- Detects mobile devices via user agent + touch support
- Only renders during gameplay phase
- Uses `requestPhase()` and `requestDash()` from GameController
- Prevents click-through with proper z-indexing

### Mobile Wallet Helper
Location: `src/game/systems/MobileWalletHelper.ts`

Provides:
- Device detection
- Wallet availability checking
- Deep link generation
- Installation instructions
- Wallet metadata (name, icon, status)

### Web3 System Integration
Location: `src/game/systems/Web3System.ts`

Extended with:
- `isMobile()` - check device type
- `getMobileWallets()` - get wallet list
- `openMobileWallet()` - launch wallet app
- Mobile-specific error messages

## CSS Architecture

### Mobile Styles
Location: `src/styles/global.css`

#### Media Query Breakpoints:
- **Mobile**: `max-width: 768px`
- **Small mobile**: `max-width: 380px`
- **Landscape**: `max-height: 500px` + `orientation: landscape`
- **Tablet**: `769px` to `1024px`

#### Touch Control Styles:
- `.touch-controls` - container positioned at bottom
- `.touch-btn` - base button with 90px size
- `.touch-btn-phase` - phase shift (left side)
- `.touch-btn-dash` - dash (right side)
- `.touch-jump-hint` - center hint text

#### Safe Area Support:
```css
@supports (padding: max(0px)) {
  .touch-controls {
    padding-bottom: max(env(safe-area-inset-bottom), 30px);
  }
}
```

## Performance Considerations

### Current Optimizations:
- Touch events use `preventDefault()` to avoid 300ms click delay
- Passive scroll listeners where possible
- CSS transforms for smooth animations
- Minimal reflows with fixed positioning

### Future Optimizations:
- [ ] Reduce particle counts on mobile
- [ ] Lower texture quality on low-memory devices
- [ ] Adaptive frame rate based on device capability
- [ ] Service worker for offline play
- [ ] Web App Manifest for "Add to Home Screen"

## Mobile Wallet Deep Links

### MetaMask Mobile
```
https://metamask.app.link/dapp/{encoded_url}
```

### Trust Wallet
```
https://link.trustwallet.com/open_url?coin_id=60&url={encoded_url}
```

### Rainbow
```
https://rnbwapp.com/
```

## Troubleshooting

### Issue: Touch controls not showing
**Solution**: Check device detection in console:
```javascript
console.log(MobileWalletHelper.isMobile());
```

### Issue: Wallet not connecting on mobile
**Solution**: 
1. Ensure you're using wallet's in-app browser
2. Check wallet is on Hemi Network (Chain ID: 43111)
3. Try "Open in Wallet" option from mobile wallet selector

### Issue: UI overlapping on small screens
**Solution**: 
- Portrait mode is recommended for best experience
- Landscape mode available but more compact
- Some controls hidden in landscape to save space

### Issue: Performance issues on older devices
**Current**: Game runs at full quality on all devices
**Future**: Device capability detection and adaptive quality

## Related Files

- `src/react/components/TouchControls.tsx` - Touch control UI
- `src/react/components/MobileWalletSelector.tsx` - Wallet selection
- `src/game/systems/MobileWalletHelper.ts` - Mobile wallet utilities
- `src/game/systems/Web3System.ts` - Wallet connection logic
- `src/styles/global.css` - Mobile-responsive styles
- `index.html` - Mobile viewport meta tags

## Testing Checklist

- [ ] Touch controls appear on mobile
- [ ] Touch controls hidden on desktop
- [ ] Phase shift button works
- [ ] Dash button works (when meter full)
- [ ] Tap-to-jump works
- [ ] Wallet selector shows on mobile
- [ ] Deep links work for installed wallets
- [ ] Installation guidance shows for missing wallets
- [ ] UI adapts to small screens
- [ ] Landscape mode works
- [ ] Safe area insets respected
- [ ] No layout shift on orientation change
- [ ] Game playable in both orientations

## Future Enhancements

### Planned:
- [ ] Haptic feedback for touch events
- [ ] Progressive Web App (PWA) support
- [ ] Offline gameplay with cached assets
- [ ] Touch gesture support (swipe to phase shift)
- [ ] Adaptive quality settings
- [ ] Device-specific optimizations

### Under Consideration:
- [ ] Gyroscope/accelerometer controls
- [ ] Local multiplayer via Bluetooth
- [ ] Mobile-specific achievements
- [ ] Battery-saving mode
- [ ] Reduced motion option for accessibility

## Resources

- [Phaser 3 Mobile Guide](https://phaser.io/tutorials/making-your-first-phaser-3-game)
- [MetaMask Mobile Deep Links](https://docs.metamask.io/wallet/how-to/use-mobile/)
- [iOS Safe Area Guide](https://webkit.org/blog/7929/designing-websites-for-iphone-x/)
- [Android Web Best Practices](https://developer.android.com/develop/ui/views/layout/webapps)
