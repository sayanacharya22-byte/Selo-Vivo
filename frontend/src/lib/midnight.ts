import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import type { ContractAddress, SigningKey } from "@midnight-ntwrk/compact-runtime";
import type {
  ExportPrivateStatesOptions,
  ImportPrivateStatesResult,
  ImportPrivateStatesOptions,
  ImportSigningKeysOptions,
  ImportSigningKeysResult,
  MidnightProvider,
  MidnightProviders,
  PrivateStateExport,
  PrivateStateProvider,
  SigningKeyExport,
  WalletProvider,
} from "@midnight-ntwrk/midnight-js/types";

import type { LocalCredential } from "./vault";
import { hexToBytes } from "./vault";
import type { MidnightNetwork } from "./wallet";
import "./browser-polyfills";

type SeloVivoPrivateState = {
  issuerCommitment: Uint8Array;
  credentialClass: bigint;
  expiryEpoch: bigint;
  biomeGroup: bigint;
  holderSecret: Uint8Array;
};

type FinalizedCall = { public: { txId: string; txHash: string; status: string } };
type FinalizedDeployment = {
  deployTxData: { public: { contractAddress: string; status: string; txId: string; txHash: string } };
  callTx: {
    prove_credential(
      requiredClass: bigint,
      minimumExpiryEpoch: bigint,
      requiredBiomeGroup: bigint,
      requestTag: Uint8Array,
    ): Promise<FinalizedCall>;
  };
};

export type ProofReceipt = {
  contractAddress: string;
  deploymentTxId: string;
  proofTxId: string;
  proofTxHash: string;
  network: MidnightNetwork;
  walletAddress: string;
};

let activeDeployment: {
  wallet: ConnectedAPI;
  walletAddress: string;
  network: MidnightNetwork;
  value: FinalizedDeployment;
} | null = null;

const fetchZkAsset: typeof fetch = (input, init) => {
  const source = input instanceof Request ? input.url : input.toString();
  const url = new URL(source, window.location.origin);
  if (url.hash) {
    const filename = decodeURIComponent(url.hash.slice(1));
    const directory = url.pathname.slice(0, url.pathname.lastIndexOf("/"));
    url.pathname = `${directory}/${filename}`;
    url.hash = "";
  }
  return fetch(url.toString(), init);
};

class EphemeralPrivateStateProvider implements PrivateStateProvider<string, SeloVivoPrivateState> {
  private readonly states = new Map<string, SeloVivoPrivateState>();
  private readonly signingKeys = new Map<ContractAddress, SigningKey>();

  setContractAddress(address: ContractAddress): void { void address; }
  async set(id: string, value: SeloVivoPrivateState): Promise<void> { this.states.set(id, value); }
  async get(id: string): Promise<SeloVivoPrivateState | null> { return this.states.get(id) ?? null; }
  async remove(id: string): Promise<void> { this.states.delete(id); }
  async clear(): Promise<void> { this.states.clear(); }
  async setSigningKey(address: ContractAddress, key: SigningKey): Promise<void> { this.signingKeys.set(address, key); }
  async getSigningKey(address: ContractAddress): Promise<SigningKey | null> { return this.signingKeys.get(address) ?? null; }
  async removeSigningKey(address: ContractAddress): Promise<void> { this.signingKeys.delete(address); }
  async clearSigningKeys(): Promise<void> { this.signingKeys.clear(); }
  async exportPrivateStates(options?: ExportPrivateStatesOptions): Promise<PrivateStateExport> {
    void options;
    throw new Error("A exportação é bloqueada: o estado privado só existe nesta sessão.");
  }
  async importPrivateStates(data: PrivateStateExport, options?: ImportPrivateStatesOptions): Promise<ImportPrivateStatesResult> {
    void data; void options;
    throw new Error("A importação é bloqueada para o estado efêmero.");
  }
  async exportSigningKeys(): Promise<SigningKeyExport> {
    throw new Error("A chave de manutenção não é exportável.");
  }
  async importSigningKeys(data: SigningKeyExport, options?: ImportSigningKeysOptions): Promise<ImportSigningKeysResult> {
    void data; void options;
    throw new Error("A chave de manutenção não é importável.");
  }
}

function toPrivateState(credential: LocalCredential): SeloVivoPrivateState {
  return {
    issuerCommitment: hexToBytes(credential.issuerCommitmentHex),
    credentialClass: BigInt(credential.credentialClass),
    expiryEpoch: BigInt(credential.expiryEpoch),
    biomeGroup: BigInt(credential.biomeGroup),
    holderSecret: hexToBytes(credential.holderSecretHex),
  };
}

async function sha256Bytes(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}

async function deploy(
  wallet: ConnectedAPI,
  walletAddress: string,
  network: MidnightNetwork,
  credential: LocalCredential,
): Promise<FinalizedDeployment> {
  const configuration = await wallet.getConfiguration();
  if (configuration.networkId !== network) {
    throw new Error(`A 1AM está em ${configuration.networkId}; selecione ${network} e reconecte.`);
  }
  const dust = await wallet.getDustBalance();
  if (dust.balance <= 0n) throw new Error("Sem DUST disponível para pagar a transação.");

  const [compact, contracts, networkId, zk, indexer, providerTypes, utils, ledger, generated] = await Promise.all([
    import("@midnight-ntwrk/compact-js"),
    import("@midnight-ntwrk/midnight-js/contracts"),
    import("@midnight-ntwrk/midnight-js/network-id"),
    import("@midnight-ntwrk/midnight-js-fetch-zk-config-provider"),
    import("@midnight-ntwrk/midnight-js-indexer-public-data-provider"),
    import("@midnight-ntwrk/midnight-js/types"),
    import("@midnight-ntwrk/midnight-js/utils"),
    import("@midnight-ntwrk/ledger-v8"),
    import("../../generated/selo-vivo/contract/index.js"),
  ]);

  networkId.setNetworkId(network);
  const addresses = await wallet.getShieldedAddresses();
  const assetBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin).toString();
  const zkConfigProvider = new zk.FetchZkConfigProvider<string>(assetBaseUrl, fetchZkAsset);
  const proofProvider = providerTypes.createProofProvider(
    await wallet.getProvingProvider(zkConfigProvider.asKeyMaterialProvider()),
  );
  const privateState = new EphemeralPrivateStateProvider();
  const initialPrivateState = toPrivateState(credential);
  const compiledContract = compact.CompiledContract.make("selo-vivo", generated.Contract).pipe(
    compact.CompiledContract.withWitnesses({
      private_issuer_commitment: (context: { privateState: SeloVivoPrivateState }) => [context.privateState, context.privateState.issuerCommitment],
      private_credential_class: (context: { privateState: SeloVivoPrivateState }) => [context.privateState, context.privateState.credentialClass],
      private_expiry_epoch: (context: { privateState: SeloVivoPrivateState }) => [context.privateState, context.privateState.expiryEpoch],
      private_biome_group: (context: { privateState: SeloVivoPrivateState }) => [context.privateState, context.privateState.biomeGroup],
      private_holder_secret: (context: { privateState: SeloVivoPrivateState }) => [context.privateState, context.privateState.holderSecret],
    }),
  );

  const walletProvider: WalletProvider = {
    getCoinPublicKey: () => addresses.shieldedCoinPublicKey as ReturnType<WalletProvider["getCoinPublicKey"]>,
    getEncryptionPublicKey: () => addresses.shieldedEncryptionPublicKey as ReturnType<WalletProvider["getEncryptionPublicKey"]>,
    async balanceTx(transaction) {
      const balanced = await wallet.balanceUnsealedTransaction(utils.toHex(transaction.serialize()));
      return ledger.Transaction.deserialize("signature", "proof", "binding", utils.fromHex(balanced.tx)) as Awaited<ReturnType<WalletProvider["balanceTx"]>>;
    },
  };
  const midnightProvider: MidnightProvider = {
    async submitTx(transaction) {
      await wallet.submitTransaction(utils.toHex(transaction.serialize()));
      const [txId] = transaction.identifiers();
      if (!txId) throw new Error("A carteira finalizou sem identificador de transação.");
      return txId;
    },
  };
  const providers = {
    privateStateProvider: privateState,
    publicDataProvider: indexer.indexerPublicDataProvider(
      configuration.indexerUri,
      configuration.indexerWsUri,
      window.WebSocket,
    ),
    zkConfigProvider,
    proofProvider,
    walletProvider,
    midnightProvider,
  } as unknown as MidnightProviders;

  const submit = contracts.deployContract as unknown as (
    providers: MidnightProviders,
    options: unknown,
  ) => Promise<FinalizedDeployment>;
  const deployed = await submit(providers, {
    compiledContract,
    args: [initialPrivateState.issuerCommitment],
    privateStateId: "selo-vivo-private-state",
    initialPrivateState,
  });
  if (deployed.deployTxData.public.status !== "SucceedEntirely") {
    throw new Error("O contrato foi enviado, mas não finalizou por completo.");
  }
  activeDeployment = { wallet, walletAddress, network, value: deployed };
  return deployed;
}

export async function proveCredential(input: {
  wallet: ConnectedAPI;
  walletAddress: string;
  network: MidnightNetwork;
  credential: LocalCredential;
  requirement: string;
  requiredClass: number;
  minimumExpiryEpoch: number;
  requiredBiomeGroup: number;
}): Promise<ProofReceipt> {
  const current = activeDeployment?.wallet === input.wallet
    && activeDeployment.walletAddress === input.walletAddress
    && activeDeployment.network === input.network
    ? activeDeployment.value
    : await deploy(input.wallet, input.walletAddress, input.network, input.credential);
  const requestTag = await sha256Bytes(input.requirement.trim());
  const proof = await current.callTx.prove_credential(
    BigInt(input.requiredClass),
    BigInt(input.minimumExpiryEpoch),
    BigInt(input.requiredBiomeGroup),
    requestTag,
  );
  if (proof.public.status !== "SucceedEntirely") throw new Error("A prova foi rejeitada antes da finalização.");
  return {
    contractAddress: current.deployTxData.public.contractAddress,
    deploymentTxId: current.deployTxData.public.txId,
    proofTxId: proof.public.txId,
    proofTxHash: proof.public.txHash,
    network: input.network,
    walletAddress: input.walletAddress,
  };
}

export function describeMidnightError(reason: unknown): string {
  const message = reason instanceof Error ? reason.message : String(reason);
  const normalized = message.toLowerCase();
  if (normalized.includes("dust")) return "Sem DUST utilizável. Ative ou financie DUST na 1AM e tente novamente.";
  if (normalized.includes("prover") || normalized.includes("proving")) return "A 1AM não conseguiu alcançar o serviço de prova configurado.";
  if (normalized.includes("indexer") || normalized.includes("websocket")) return "O indexador configurado na 1AM está indisponível.";
  if (normalized.includes("rejected") || normalized.includes("denied")) return "A operação foi recusada na 1AM; nada foi publicado.";
  return message || "A prova não pôde ser finalizada.";
}
