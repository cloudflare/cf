---
"cf": minor
---

Initialize Workers with Vite+ checks, formatting, and Workers-runtime tests. Align Vite and Vitest across supported package managers while keeping cf responsible for development, builds, and deployment.

Use the project-local `vp` executable for Vite+ development and builds. This avoids downloading a separate Vite with npm or failing to find a `vite` executable with pnpm.
