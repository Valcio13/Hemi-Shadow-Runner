/**
 * Web3Config — Hemi network parameters + score-submission settings.
 *
 * Two Hemi networks are defined; DEFAULT_CHAIN picks which one the game targets.
 * We start on the testnet so players never risk mainnet gas just to log a score.
 *
 * Submission mode is 'attestation' (default): the player signs a structured
 * message with their score via personal_sign. This is GASLESS and needs no
 * deployed contract — the signature is a verifiable claim ("wallet X scored N
 * at time T on Hemi Shadow Runner") that a backend or on-chain verifier can
 * check later. Swapping to a real contract tx is a localized change in
 * Web3System.submitScore (see the 'contract' branch note there).
 */

export interface ChainParams {
  chainId: number;
  chainIdHex: string;
  name: string;
  rpcUrls: string[];
  nativeCurrency: { name: string; symbol: string; decimals: number };
  blockExplorerUrls: string[];
}

export const HEMI_MAINNET: ChainParams = {
  chainId: 43111,
  chainIdHex: '0xa867',
  name: 'Hemi',
  rpcUrls: ['https://rpc.hemi.network/rpc'],
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://explorer.hemi.xyz'],
};

export const HEMI_SEPOLIA: ChainParams = {
  chainId: 743111,
  chainIdHex: '0xb56c7',
  name: 'Hemi Sepolia',
  rpcUrls: ['https://testnet.rpc.hemi.network/rpc'],
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  blockExplorerUrls: ['https://testnet.explorer.hemi.xyz'],
};

/** Which network the game targets. Flip to HEMI_MAINNET for production. */
export const DEFAULT_CHAIN: ChainParams = HEMI_MAINNET;

export const WEB3 = {
  // 'attestation' = gasless personal_sign of the score. 'contract' = on-chain tx
  // (requires SCORE_CONTRACT below + an ABI). Attestation keeps the demo free.
  SUBMISSION_MODE: 'contract' as 'attestation' | 'contract',
  // App tag embedded in the signed message so signatures can't be replayed
  // against another dapp.
  APP_TAG: 'Hemi Shadow Runner',
  // Contract address for on-chain score submission
  SCORE_CONTRACT: '0xD2c7C67721F155424A24c148D15bCeba36F5dfEe' as string,
} as const;

/**
 * Build the human-readable message the player signs. Kept deterministic and
 * explicit so anyone verifying the signature can reconstruct it exactly.
 */
export function buildScoreMessage(params: {
  address: string;
  score: number;
  coins: number;
  timestamp: number;
}): string {
  const { address, score, coins, timestamp } = params;
  return [
    `${WEB3.APP_TAG} — Score Attestation`,
    ``,
    `Player: ${address}`,
    `Score: ${score}`,
    `Coins: ${coins}`,
    `Chain: ${DEFAULT_CHAIN.name} (${DEFAULT_CHAIN.chainId})`,
    `Timestamp: ${timestamp}`,
    ``,
    `Signing this message costs no gas and authorizes nothing on-chain.`,
  ].join('\n');
}
