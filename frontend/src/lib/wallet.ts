import type { ConnectedAPI, InitialAPI } from "@midnight-ntwrk/dapp-connector-api";

export type MidnightNetwork = "preview" | "preprod";

export type WalletSession = {
  api: ConnectedAPI;
  address: string;
  network: MidnightNetwork;
  walletName: string;
};

export function listInjectedWallets(): InitialAPI[] {
  if (typeof window === "undefined" || !window.midnight) return [];
  return Object.values(window.midnight).filter(
    (wallet): wallet is InitialAPI => Boolean(wallet?.name && wallet?.connect),
  );
}

export function selectOneAmWallet(wallets = listInjectedWallets()): InitialAPI | undefined {
  return wallets.find((wallet) => /1am/i.test(wallet.name)) ?? wallets[0];
}

export async function connectWallet(network: MidnightNetwork): Promise<WalletSession> {
  const wallet = selectOneAmWallet();
  if (!wallet) {
    throw new Error("1AM Wallet não encontrada. Instale ou habilite a extensão e atualize a página.");
  }

  const major = Number.parseInt(wallet.apiVersion.split(".")[0] ?? "0", 10);
  if (major < 4) {
    throw new Error(`A carteira expõe DApp Connector ${wallet.apiVersion}; é necessário 4.x.`);
  }

  const api = await wallet.connect(network);
  await api.hintUsage([
    "getUnshieldedAddress",
    "getConfiguration",
    "getProvingProvider",
    "balanceUnsealedTransaction",
    "submitTransaction",
  ]);

  const [{ unshieldedAddress }, configuration, status] = await Promise.all([
    api.getUnshieldedAddress(),
    api.getConfiguration(),
    api.getConnectionStatus(),
  ]);

  if (status.status !== "connected" || configuration.networkId !== network) {
    throw new Error(`A carteira não confirmou a rede ${network}.`);
  }

  return { api, address: unshieldedAddress, network, walletName: wallet.name };
}

export function shortAddress(address: string): string {
  return address.length < 18 ? address : `${address.slice(0, 9)}…${address.slice(-6)}`;
}
