const API_ROOT = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "";
const REQUEST_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  constructor(message: string, readonly status: number | null, readonly requestId: string | null) {
    super(message);
    this.name = "ApiError";
  }
}

export type ProofPlan = {
  summary: string;
  public_disclosures: string[];
  private_inputs: string[];
  circuit_checks: string[];
  risk_notes: string[];
  confidence: number;
};

export type ComposeResponse = {
  plan: ProofPlan;
  provider: "gemini" | "local";
  model: string | null;
  redactions: string[];
  safety_note: string;
};

export type Dashboard = {
  verified_proofs: number;
  active_issuers: number;
  composer_runs: number;
  disclosure_reduction_percent: number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_ROOT}${path}`, {
      ...init,
      signal: init?.signal ?? controller.signal,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new ApiError(
        detail || `API respondeu ${response.status}.`,
        response.status,
        response.headers.get("x-request-id"),
      );
    }
    return response.json() as Promise<T>;
  } catch (reason) {
    if (reason instanceof DOMException && reason.name === "AbortError") {
      throw new ApiError("A API demorou mais de 10 segundos para responder.", null, null);
    }
    throw reason;
  } finally {
    window.clearTimeout(timer);
  }
}

export function composeProof(requirement: string): Promise<ComposeResponse> {
  return request("/api/v1/compose", {
    method: "POST",
    body: JSON.stringify({
      requirement,
      credential_labels: ["agricultura regenerativa", "vigência", "bioma amplo"],
    }),
  });
}

export function fetchDashboard(): Promise<Dashboard> {
  return request("/api/v1/dashboard");
}

export async function requestTag(requirement: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(requirement.trim())));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function recordProof(input: {
  network: "preview" | "preprod";
  transactionId: string;
  contractAddress: string;
  requirement: string;
}): Promise<void> {
  await request("/api/v1/proofs", {
    method: "POST",
    body: JSON.stringify({
      network: input.network,
      transaction_id: input.transactionId,
      contract_address: input.contractAddress,
      credential_class: "regenerative",
      request_tag: await requestTag(input.requirement),
      public_scope: { class: "regenerative", result: "valid" },
      valid: true,
    }),
  });
}
