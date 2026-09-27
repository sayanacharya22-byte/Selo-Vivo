import type { ProofReceipt } from "./midnight";

export const PUBLIC_RECEIPT_FORMAT = "selo-vivo/public-proof-receipt" as const;

export type PublicProofReceipt = {
  format: typeof PUBLIC_RECEIPT_FORMAT;
  version: 1;
  status: "verified";
  network: ProofReceipt["network"];
  contract_address: string;
  deployment_transaction_id: string;
  proof_transaction_id: string;
  proof_transaction_hash: string;
  requirement_tag: string;
  verified_at: string;
  privacy: {
    contains_private_data: false;
    excluded: readonly ["wallet address", "credential", "witness values", "holder secret"];
  };
};

export function createPublicProofReceipt(receipt: ProofReceipt): PublicProofReceipt {
  return {
    format: PUBLIC_RECEIPT_FORMAT,
    version: 1,
    status: "verified",
    network: receipt.network,
    contract_address: receipt.contractAddress,
    deployment_transaction_id: receipt.deploymentTxId,
    proof_transaction_id: receipt.proofTxId,
    proof_transaction_hash: receipt.proofTxHash,
    requirement_tag: receipt.requirementTag,
    verified_at: receipt.verifiedAt,
    privacy: {
      contains_private_data: false,
      excluded: ["wallet address", "credential", "witness values", "holder secret"],
    },
  };
}

export function serializePublicProofReceipt(receipt: PublicProofReceipt): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function publicReceiptFilename(receipt: PublicProofReceipt): string {
  const transaction = receipt.proof_transaction_id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 16) || "verified";
  return `selo-vivo-proof-${transaction}.json`;
}

export function downloadPublicProofReceipt(receipt: PublicProofReceipt): void {
  const url = URL.createObjectURL(new Blob([serializePublicProofReceipt(receipt)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = publicReceiptFilename(receipt);
  anchor.hidden = true;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
