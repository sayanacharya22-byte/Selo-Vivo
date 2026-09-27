import { useCallback, useState } from "react";

import { connectWallet, type MidnightNetwork, type WalletSession } from "../lib/wallet";

export function useWallet() {
  const [network, setNetwork] = useState<MidnightNetwork>("preview");
  const [session, setSession] = useState<WalletSession | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    setStatus("connecting");
    setError(null);
    try {
      const nextSession = await connectWallet(network);
      setSession(nextSession);
      setStatus("connected");
    } catch (reason) {
      setSession(null);
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "Não foi possível conectar a carteira.");
    }
  }, [network]);

  const disconnect = useCallback(() => {
    setSession(null);
    setStatus("idle");
    setError(null);
  }, []);

  const changeNetwork = useCallback((next: MidnightNetwork) => {
    setNetwork(next);
    setSession(null);
    setStatus("idle");
    setError(null);
  }, []);

  return { network, session, status, error, connect, disconnect, changeNetwork };
}
