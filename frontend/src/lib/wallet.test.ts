import { afterEach, describe, expect, it } from "vitest";

import { listInjectedWallets, selectOneAmWallet, shortAddress } from "./wallet";

describe("DApp Connector discovery", () => {
  afterEach(() => {
    delete window.midnight;
  });

  it("discovers UUID-keyed wallets and prefers 1AM", () => {
    const other = { name: "Other", rdns: "dev.other", icon: "", apiVersion: "4.0.1", connect: async () => ({}) };
    const oneAm = { name: "1AM", rdns: "io.midnight.1am", icon: "", apiVersion: "4.0.1", connect: async () => ({}) };
    window.midnight = { "uuid-a": other, "uuid-b": oneAm } as unknown as typeof window.midnight;
    expect(listInjectedWallets()).toHaveLength(2);
    expect(selectOneAmWallet()?.name).toBe("1AM");
  });

  it("shortens a wallet address without losing both ends", () => {
    expect(shortAddress("mn_addr_1234567890abcdefghijkl")).toBe("mn_addr_1…ghijkl");
  });
});
