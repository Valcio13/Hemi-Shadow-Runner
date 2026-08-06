/**
 * TransactionStatus — overlay showing transaction progress (loading/confirming/success/error)
 * 
 * Listens to TX events from EventBus and displays appropriate feedback:
 * - TX_STARTED: "Approve in wallet..."
 * - TX_PENDING: "Confirming transaction..." with spinner
 * - TX_SUCCESS: "Transaction confirmed!" (auto-dismiss after 2s)
 * - TX_ERROR: "Transaction failed" (dismissable)
 */
import { useEffect, useState } from 'react';
import { EventBus, GameEvents } from '../../game/EventBus';

type TxType = 'startGame' | 'submitScore';
type TxStatus = 'idle' | 'started' | 'pending' | 'success' | 'error';

interface TxState {
  status: TxStatus;
  type: TxType | null;
  message: string;
  txHash?: string;
}

export function TransactionStatus() {
  const [tx, setTx] = useState<TxState>({
    status: 'idle',
    type: null,
    message: '',
  });

  useEffect(() => {
    const onStarted = (data: { type: TxType; message: string }) => {
      setTx({ status: 'started', type: data.type, message: data.message });
    };

    const onPending = (data: { type: TxType; message: string; txHash?: string }) => {
      setTx({ status: 'pending', type: data.type, message: data.message, txHash: data.txHash });
    };

    const onSuccess = (data: { type: TxType; message: string; txHash?: string }) => {
      setTx({ status: 'success', type: data.type, message: data.message, txHash: data.txHash });
      // Auto-dismiss success after 3 seconds
      setTimeout(() => {
        setTx({ status: 'idle', type: null, message: '' });
      }, 3000);
    };

    const onError = (data: { type: TxType; message: string }) => {
      setTx({ status: 'error', type: data.type, message: data.message });
      // Auto-dismiss error after 5 seconds
      setTimeout(() => {
        setTx({ status: 'idle', type: null, message: '' });
      }, 5000);
    };

    EventBus.on(GameEvents.TX_STARTED, onStarted);
    EventBus.on(GameEvents.TX_PENDING, onPending);
    EventBus.on(GameEvents.TX_SUCCESS, onSuccess);
    EventBus.on(GameEvents.TX_ERROR, onError);

    return () => {
      EventBus.off(GameEvents.TX_STARTED, onStarted);
      EventBus.off(GameEvents.TX_PENDING, onPending);
      EventBus.off(GameEvents.TX_SUCCESS, onSuccess);
      EventBus.off(GameEvents.TX_ERROR, onError);
    };
  }, []);

  if (tx.status === 'idle') return null;

  const dismiss = () => setTx({ status: 'idle', type: null, message: '' });

  return (
    <div className="tx-status-overlay">
      <div className={`tx-status tx-status-${tx.status}`}>
        <div className="tx-status-icon">
          {tx.status === 'started' && '⏳'}
          {tx.status === 'pending' && <span className="tx-spinner"></span>}
          {tx.status === 'success' && '✅'}
          {tx.status === 'error' && '❌'}
        </div>
        <div className="tx-status-content">
          <div className="tx-status-message">{tx.message}</div>
          {tx.txHash && (
            <a
              href={`https://testnet.explorer.hemi.xyz/tx/${tx.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="tx-status-link"
            >
              View on Explorer →
            </a>
          )}
        </div>
        {(tx.status === 'success' || tx.status === 'error') && (
          <button className="tx-status-close" onClick={dismiss} aria-label="Dismiss">
            ×
          </button>
        )}
      </div>
    </div>
  );
}
