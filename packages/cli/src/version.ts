/**
 * Single source of truth for the CLI version at runtime.
 *
 * JSON imports are statically inlined by Vite+ Pack/Rolldown (bundled
 * output) and Node/tsx (dev), so there is no need for a build-time
 * `define` sentinel or a runtime `createRequire` fallback.
 *
 * The `CLI_VERSION` env var override is preserved for the
 * wrangler-tests harness (vitest.setup.ts), which pins a deterministic
 * version string ("x.x.x") so snapshots don't churn on every release.
 */

import pkg from "../package.json" with { type: "json" };

export const VERSION = process.env.CLI_VERSION ?? pkg.version;

/**
 * User-Agent sent on every outbound Cloudflare request — both the generated
 * API client (see `request-headers.ts`) and the shared auth layer's
 * account/membership calls (see `lib/oauth`). Kept in one place so the two
 * never drift apart.
 */
export const USER_AGENT = `cf-cli/${VERSION}`;
