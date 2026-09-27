import { describe, expect, it } from "vitest";

import type { ProofReceipt } from "./midnight";
import {
  createPublicProofReceipt,
  publicReceiptFilename,
  serializePublicProofReceipt,
} from "./publicReceipt";

const privateWalletAddress = "mn_addr_private_holder_123";
const receipt: ProofReceipt = {
  contractAddress: "contract_0308c9a74f",
  deploymentTxId: "deploy_123",
  proofTxId: "proof:tx/abc-123",
  proofTxHash: "hash_abc123",
  requirementTag: "4f3d9b7c2e1a851e0bc4",
  verifiedAt: "2026-09-27T16:44:00.000Z",
  network: "preview",
  walletAddress: privateWalletAddress,
};

describe("public proof receipt", () => {
  it("exports the public ledger references needed to verify a proof", () => {
    expect(createPublicProofReceipt(receipt)).toMatchObject({
      format: "selo-vivo/public-proof-receipt",
      version: 1,
      status: "verified",
      network: "preview",
      contract_address: receipt.contractAddress,
      proof_transaction_id: receipt.proofTxId,
      requirement_tag: receipt.requirementTag,
      verified_at: receipt.verifiedAt,
    });
  });

  it("never serializes the wallet address or private proof material", () => {
    const serialized = serializePublicProofReceipt(createPublicProofReceipt(receipt));

    expect(serialized).not.toContain(privateWalletAddress);
    expect(serialized).not.toContain("walletAddress");
    expect(serialized).not.toContain("holderSecret");
    expect(serialized).toContain('"contains_private_data": false');
  });

  it("creates a filesystem-safe, transaction-linked filename", () => {
    expect(publicReceiptFilename(createPublicProofReceipt(receipt))).toBe("selo-vivo-proof-prooftxabc-123.json");
  });
});
