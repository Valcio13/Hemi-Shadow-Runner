/**
 * MobileWalletSelector - Mobile wallet selection with deep links
 * 
 * Shows available mobile wallets and provides installation instructions
 */
import { web3 } from '../../game/systems/Web3System';

interface MobileWalletSelectorProps {
  onClose: () => void;
}

export function MobileWalletSelector({ onClose }: MobileWalletSelectorProps) {
  const wallets = web3.getMobileWallets();
  const installed = wallets.filter(w => w.installed);
  const notInstalled = wallets.filter(w => !w.installed);

  const handleWalletClick = (deepLink: string, installed: boolean) => {
    if (installed) {
      // Wallet is installed, try to connect
      void web3.connect();
      onClose();
    } else {
      // Redirect to wallet installation/deep link
      window.location.href = deepLink;
    }
  };

  return (
    <div className="overlay">
      <div className="panel panel-mobile-wallet">
        <div className="panel-header">
          <h2 className="panel-title">Connect Wallet</h2>
          <button className="panel-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {installed.length > 0 && (
          <div className="mobile-wallet-section">
            <h3 className="mobile-wallet-section-title">📱 Available Wallets</h3>
            <div className="mobile-wallet-list">
              {installed.map((wallet) => (
                <button
                  key={wallet.name}
                  className="mobile-wallet-btn mobile-wallet-installed"
                  onClick={() => handleWalletClick(wallet.deepLink, true)}
                >
                  <span className="mobile-wallet-icon">{wallet.icon}</span>
                  <span className="mobile-wallet-name">{wallet.name}</span>
                  <span className="mobile-wallet-status">✓ Installed</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {notInstalled.length > 0 && (
          <div className="mobile-wallet-section">
            <h3 className="mobile-wallet-section-title">
              {installed.length > 0 ? '💾 Install More' : '💾 Install a Wallet'}
            </h3>
            <div className="mobile-wallet-list">
              {notInstalled.map((wallet) => (
                <button
                  key={wallet.name}
                  className="mobile-wallet-btn mobile-wallet-not-installed"
                  onClick={() => handleWalletClick(wallet.deepLink, false)}
                >
                  <span className="mobile-wallet-icon">{wallet.icon}</span>
                  <span className="mobile-wallet-name">{wallet.name}</span>
                  <span className="mobile-wallet-action">Install →</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mobile-wallet-info">
          <p>
            💡 After installing, open this game from your wallet's browser to connect automatically.
          </p>
        </div>

        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
