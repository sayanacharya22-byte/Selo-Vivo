# Netlify + Render deployment runbook

This repository is configured for a Netlify-hosted React frontend and a Render-hosted FastAPI backend. Both services deploy from `main`; GitHub Actions remains the compile, test, lint, and container-build quality gate.

## 1. Deploy the API on Render

1. In Render, create a **Blueprint** from `sayanacharya22-byte/Selo-Vivo` and keep the Blueprint path as `render.yaml`.
2. Supply the prompted secrets:

   | Variable | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled connection string (`-pooler` hostname) |
   | `DATABASE_URL_UNPOOLED` | Neon direct connection string used by Alembic |
   | `GEMINI_API_KEY` | Server-side Gemini API key |
   | `CORS_ORIGINS` | Exact Netlify origin, for example `https://selo-vivo.netlify.app` |

3. Do not add quotes around Render environment values. Never prefix backend secrets with `VITE_`.
4. Deploy and copy the generated API URL, such as `https://selo-vivo-api.onrender.com`.
5. Verify both endpoints:

   ```text
   https://YOUR-RENDER-HOST/health
   https://YOUR-RENDER-HOST/ready
   ```

`/health` proves the process is serving traffic. `/ready` additionally proves the Neon connection works. Render automatically supplies `RENDER_EXTERNAL_HOSTNAME`; the API adds it to the trusted-host list. Add custom API domains to `ALLOWED_HOSTS` only when you configure one.

The free Render plan does not provide a separate pre-deploy command, so the Blueprint runs `alembic upgrade head` before starting its single Uvicorn process. If the service is later scaled beyond one instance, move migrations to Render's paid pre-deploy command before scaling.

## 2. Deploy the frontend on Netlify

1. Import the same GitHub repository into Netlify.
2. Netlify reads `netlify.toml`; do not override its build command or publish directory in the dashboard.
3. Under **Project configuration → Environment variables**, add:

   | Variable | Required production value |
   |---|---|
   | `VITE_API_URL` | Exact HTTPS Render origin, with no trailing slash |

4. Trigger a new production deploy after saving the variables. Vite embeds `VITE_*` values at build time, so changing one always requires a rebuild.
5. Copy the final `https://...netlify.app` URL. If it differs from the value in Render's `CORS_ORIGINS`, update that Render variable and redeploy the API.

Never put `GEMINI_API_KEY`, `DATABASE_URL`, credentials, witness data, or wallet secrets in Netlify environment variables. Everything beginning with `VITE_` is public browser configuration.

## 3. Production smoke test

1. Open the Netlify URL in a fresh Chrome profile with the 1AM wallet enabled.
2. Confirm the dashboard loads without a CORS or `Failed to fetch` error.
3. Run the Gemini composer and confirm the response reports `provider: gemini` in the network response.
4. Connect 1AM, select Preview or Preprod, and load the local credential.
5. Submit one proof, approve the deployment and circuit transactions in 1AM, and confirm the new per-wallet contract address and finalized proof transaction appear in the interface.
6. Refresh `/ready` and confirm it still returns HTTP 200.
7. Check browser developer tools: no backend secret or private witness value should appear in source, storage, requests, or logs.

For a custom frontend domain, add its exact HTTPS origin to `CORS_ORIGINS` as a comma-separated value. Netlify deploy-preview origins are intentionally not wildcarded into production CORS; add a narrowly scoped preview origin only when you actively test it.

## Per-wallet Midnight deployment

No contract address is configured on Netlify. On the first proof in a page session, the connected 1AM wallet deploys a new constructor-bound contract on the network selected in the UI. The resulting address is tied to that wallet and network in the in-memory application session and is reused for additional proofs until the wallet, network, or page session changes. A different wallet receives a different deployment.

The user therefore needs enough test DUST for both the contract deployment and proof transaction. Preview and Preprod remain explicitly selectable in the UI, and the 1AM wallet must be configured for the same network before connecting.
