# Route inventory

The Vite application currently has no router. `frontend/src/App.tsx` always renders the same route:

| URL | Page | Layout |
| --- | --- | --- |
| `/` | `ProofStudio` | `AppShell` |

Deployment rewrites all paths to `index.html` in `vercel.json`, but no client-side route resolution is implemented. The production evolution should either keep navigation clearly scoped as section controls or add real routes before presenting sidebar items as navigable destinations.
