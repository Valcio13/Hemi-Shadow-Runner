# Deployment Guide

This guide covers deploying Hemi Shadow Runner to various platforms and configuring it for production use.

## 📋 Pre-Deployment Checklist

Before deploying to production:

- [ ] Switch to Hemi Mainnet (see Network Configuration below)
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify all game mechanics work
- [ ] Test wallet connection and score signing
- [ ] Check bundle size: `npm run build` (should be < 500KB)
- [ ] Update meta tags and SEO information
- [ ] Add analytics if desired
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up custom domain (if applicable)
- [ ] Test on multiple browsers and devices

## 🌐 Network Configuration

### Switching to Hemi Mainnet

The game defaults to Hemi Sepolia testnet. To switch to mainnet:

**File**: `src/game/config/Web3Config.ts`

```typescript
// Change this line:
export const DEFAULT_CHAIN: ChainParams = HEMI_SEPOLIA;

// To:
export const DEFAULT_CHAIN: ChainParams = HEMI_MAINNET;
```

**Mainnet Parameters**:
- Chain ID: `43111` (`0xa867`)
- RPC: `https://rpc.hemi.network/rpc`
- Explorer: `https://explorer.hemi.xyz`

**Important**: Test thoroughly on testnet before switching to mainnet!

## 🚀 Platform-Specific Deployment

### Vercel (Recommended)

Vercel provides zero-config deployment for Vite apps.

**Steps**:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Production deployment**:
   ```bash
   vercel --prod
   ```

**Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Netlify

**Via CLI**:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

**Via Git** (recommended):

1. Connect repository to Netlify
2. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `18` (set in `netlify.toml`)

**Configuration** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

### GitHub Pages

**Steps**:

1. **Install gh-pages**:
   ```bash
   npm install -D gh-pages
   ```

2. **Update `package.json`**:
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Update `vite.config.ts`** (add base path):
   ```typescript
   export default defineConfig({
     base: '/hemi-shadow-runner/', // Your repo name
     plugins: [react()],
   });
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch

### Railway

**Steps**:

1. **Create `railway.toml`**:
   ```toml
   [build]
   builder = "nixpacks"
   
   [deploy]
   startCommand = "npm run preview"
   ```

2. **Add start script** in `package.json`:
   ```json
   {
     "scripts": {
       "start": "vite preview --host --port $PORT"
     }
   }
   ```

3. **Deploy**:
   - Connect GitHub repo to Railway
   - Railway auto-detects Vite and deploys

### Cloudflare Pages

**Via Wrangler**:

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Deploy**:
   ```bash
   npm run build
   wrangler pages publish dist
   ```

**Via Git**:

1. Connect repository to Cloudflare Pages
2. Build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `18`

### Self-Hosted (Nginx)

**Build**:
```bash
npm run build
```

**Nginx Configuration** (`/etc/nginx/sites-available/hemi-runner`):
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/hemi-shadow-runner/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

**Deploy**:
```bash
# Copy built files
scp -r dist/* user@server:/var/www/hemi-shadow-runner/dist/

# Reload Nginx
ssh user@server 'sudo systemctl reload nginx'
```

## 🔒 Environment Variables

The game doesn't require environment variables by default. If you add backend integration:

**Create `.env.production`**:
```bash
VITE_API_URL=https://api.your-backend.com
VITE_ANALYTICS_ID=your-analytics-id
```

**Access in code**:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

## 📊 Analytics Integration

### Google Analytics

**Install**:
```bash
npm install react-ga4
```

**Add to `src/main.tsx`**:
```typescript
import ReactGA from 'react-ga4';

ReactGA.initialize('G-XXXXXXXXXX');
ReactGA.send('pageview');
```

### Plausible (Privacy-Friendly)

Add to `index.html`:
```html
<script defer data-domain="your-domain.com" src="https://plausible.io/js/script.js"></script>
```

## 🐛 Error Tracking

### Sentry

**Install**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

**Configure** (`vite.config.ts`):
```typescript
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: "your-org",
      project: "hemi-shadow-runner"
    })
  ]
});
```

**Initialize** (`src/main.tsx`):
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
});
```

## 🎨 Custom Domain Setup

### Vercel

1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Netlify

1. Go to Domain Settings
2. Add custom domain
3. Configure DNS:
   ```
   Type: A
   Name: @
   Value: 75.2.60.5
   
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   ```

### Cloudflare

1. Add site to Cloudflare
2. Update nameservers at registrar
3. Deploy to Cloudflare Pages
4. Domain auto-configured

## 🔐 Security Headers

Add these headers for production:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'self' https://*.hemi.network
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer-when-downgrade
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Platform-specific configuration**:

**Vercel** (`vercel.json`):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "SAMEORIGIN"
        }
      ]
    }
  ]
}
```

**Netlify** (`netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
```

## 📱 PWA Configuration (Optional)

To make the game installable as a PWA:

**Install plugin**:
```bash
npm install -D vite-plugin-pwa
```

**Configure** (`vite.config.ts`):
```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Hemi Shadow Runner',
        short_name: 'ShadowRunner',
        description: 'Endless runner with blockchain integration',
        theme_color: '#11131a',
        icons: [
          {
            src: 'favicon.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ]
});
```

## 🔍 SEO Optimization

**Update `index.html`**:
```html
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
  
  <!-- SEO -->
  <title>Hemi Shadow Runner - Blockchain Endless Runner Game</title>
  <meta name="description" content="Fast-paced endless runner with dual-plane mechanics. Collect coins, dash through obstacles, and sign your score on the Hemi blockchain." />
  <meta name="keywords" content="hemi, blockchain game, endless runner, web3 game, phaser game" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="Hemi Shadow Runner" />
  <meta property="og:description" content="Endless runner game with blockchain integration" />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:url" content="https://your-domain.com" />
  <meta property="og:type" content="website" />
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Hemi Shadow Runner" />
  <meta name="twitter:description" content="Endless runner game with blockchain integration" />
  <meta name="twitter:image" content="/twitter-image.png" />
</head>
```

## 📦 Build Optimization

### Bundle Size Analysis

```bash
npm install -D rollup-plugin-visualizer
```

**Configure** (`vite.config.ts`):
```typescript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});
```

**Analyze**:
```bash
npm run build
```

### Code Splitting

Vite handles this automatically, but you can manually split:

```typescript
// Lazy load components
const GameOverScreen = lazy(() => import('./components/GameOverScreen'));
```

## 🧪 Production Testing

After deployment:

1. **Test on multiple devices**:
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Chrome Android)
   - Tablet

2. **Test wallet integration**:
   - Connect MetaMask
   - Switch to Hemi network
   - Sign score attestation
   - Verify signature

3. **Performance check**:
   - Lighthouse score (aim for 90+)
   - Load time < 3s
   - Frame rate 60fps

4. **Accessibility**:
   - Keyboard navigation works
   - Screen reader compatibility
   - Color contrast (WCAG AA)

## 🔄 Continuous Deployment

### GitHub Actions

**Create `.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📞 Post-Deployment

After successful deployment:

1. **Monitor errors** (Sentry dashboard)
2. **Track analytics** (user engagement, play time)
3. **Collect feedback** (Discord, Twitter)
4. **Update documentation** with live URL
5. **Share on social media** 🎉

## 🆘 Troubleshooting

### Build fails
- Check Node version: `node -v` (should be 18+)
- Clear cache: `rm -rf node_modules package-lock.json && npm install`
- Check TypeScript errors: `npm run build`

### Wallet won't connect
- Ensure MetaMask is installed
- Check browser console for errors
- Verify network configuration in Web3Config.ts

### Assets not loading
- Check base path in `vite.config.ts`
- Verify deploy directory is `dist`
- Check browser console for 404s

### Performance issues
- Run Lighthouse audit
- Check bundle size with visualizer
- Optimize images (if added)
- Enable Gzip/Brotli compression

---

**Deployment complete!** 🚀 Your game is now live on the Hemi network!
