/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_PREVIEW_CONTRACT_ADDRESS?: string;
  readonly VITE_PREPROD_CONTRACT_ADDRESS?: string;
  readonly VITE_ALLOW_BROWSER_DEPLOY?: "true" | "false";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
