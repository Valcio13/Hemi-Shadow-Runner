/**
 * MobileWalletHelper - Utilities for mobile wallet connections
 * 
 * Provides:
 * - Detection of mobile devices
 * - Deep links to mobile wallets
 * - WalletConnect support (future)
 */

export interface MobileWalletInfo {
  name: string;
  deepLink: string;
  icon: string;
  installed: boolean;
}

export class MobileWalletHelper {
  /**
   * Check if user is on mobile device
   */
  static isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      || window.innerWidth < 768
      || ('ontouchstart' in window);
  }

  /**
   * Check if MetaMask mobile is installed
   */
  static hasMetaMaskMobile(): boolean {
    return !!(window.ethereum && window.ethereum.isMetaMask);
  }

  /**
   * Get current page URL for deep linking
   */
  static getCurrentUrl(): string {
    return window.location.href;
  }

  /**
   * Open MetaMask mobile app with deep link
   */
  static openMetaMaskMobile(): void {
    const currentUrl = this.getCurrentUrl();
    const dappUrl = encodeURIComponent(currentUrl);
    
    // MetaMask mobile deep link
    const deepLink = `https://metamask.app.link/dapp/${dappUrl}`;
    
    window.location.href = deepLink;
  }

  /**
   * Get list of supported mobile wallets
   */
  static getSupportedWallets(): MobileWalletInfo[] {
    const hasMetaMask = this.hasMetaMaskMobile();
    
    return [
      {
        name: 'MetaMask',
        deepLink: `https://metamask.app.link/dapp/${encodeURIComponent(this.getCurrentUrl())}`,
        icon: '🦊',
        installed: hasMetaMask,
      },
      {
        name: 'Trust Wallet',
        deepLink: `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(this.getCurrentUrl())}`,
        icon: '🛡️',
        installed: !!(window.ethereum && (window.ethereum as any).isTrust),
      },
      {
        name: 'Rainbow',
        deepLink: `https://rnbwapp.com/`,
        icon: '🌈',
        installed: !!(window.ethereum && (window.ethereum as any).isRainbow),
      },
    ];
  }

  /**
   * Show installation instructions for mobile
   */
  static getInstallInstructions(): string {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    if (isIOS) {
      return 'Install MetaMask from the App Store, then open this game from the MetaMask browser.';
    } else if (isAndroid) {
      return 'Install MetaMask from Google Play, then open this game from the MetaMask browser.';
    }
    return 'Please install a Web3 wallet like MetaMask.';
  }

  /**
   * Check if user should be redirected to wallet app
   */
  static shouldUseDeepLink(): boolean {
    return this.isMobile() && !this.hasMetaMaskMobile();
  }
}
