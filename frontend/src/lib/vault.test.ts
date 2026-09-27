import { describe, expect, it } from "vitest";

import { createDemoCredential, hexToBytes, rotateDemoCredential } from "./vault";

describe("private credential vault", () => {
  it("creates private material without persisting it in browser storage", () => {
    const first = createDemoCredential();
    expect(first.holderSecretHex).toHaveLength(64);
    expect(localStorage).toHaveLength(0);
    expect(sessionStorage).toHaveLength(0);
  });

  it("rotates the holder secret without changing the issuer commitment", () => {
    const first = createDemoCredential();
    const next = rotateDemoCredential();
    expect(next.holderSecretHex).not.toBe(first.holderSecretHex);
    expect(next.issuerCommitmentHex).toBe(first.issuerCommitmentHex);
  });

  it("rejects malformed Compact Bytes32 input", () => {
    expect(() => hexToBytes("abcd")).toThrow(/32 bytes/);
  });
});
