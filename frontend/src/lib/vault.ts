export type LocalCredential = {
  id: string;
  issuer: string;
  issuerCommitmentHex: string;
  credentialClass: number;
  credentialLabel: string;
  expiryEpoch: number;
  biomeGroup: number;
  biomeLabel: string;
  holderSecretHex: string;
};

export const INSTITUTO_RAIZ_COMMITMENT =
  "7be6f4a97cb7a68458b455bb8a4d60980bbf2f21b15da50ca4f3658cb6bba3ce";

function randomHex(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function createDemoCredential(): LocalCredential {
  return {
    id: `BR-RAIZ-${randomHex(6).toUpperCase()}`,
    issuer: "Instituto Raiz",
    issuerCommitmentHex: INSTITUTO_RAIZ_COMMITMENT,
    credentialClass: 1,
    credentialLabel: "Agricultura regenerativa",
    expiryEpoch: Date.UTC(2027, 11, 31, 23, 59, 59) / 1000,
    biomeGroup: 1,
    biomeLabel: "Amazônia ou Cerrado",
    holderSecretHex: randomHex(32),
  };
}

export function rotateDemoCredential(): LocalCredential {
  return createDemoCredential();
}

export function hexToBytes(value: string): Uint8Array {
  if (!/^[0-9a-f]{64}$/i.test(value)) throw new Error("Esperado valor hexadecimal de 32 bytes.");
  return Uint8Array.from(value.match(/.{2}/g)!.map((part) => Number.parseInt(part, 16)));
}
