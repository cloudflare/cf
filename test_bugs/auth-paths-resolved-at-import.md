---
slug: auth-paths-resolved-at-import
title: Auth paths were resolved at module import time
status: Fixed
fix-location: cf-only
last-verified: 2026-09-16
---

# Auth paths were resolved at module import time

## Historical symptom

cf's former auth implementation captured home-directory paths in top-level constants. Tests that changed `HOME` after importing the module could still read credentials from the developer's real home directory. The old code also looked for cf TOML credentials and a Wrangler token fallback.

## Current status

**Fixed, and the original implementation has since been replaced.** There is no `packages/cli/src/lib/oauth/tokens.ts` and cf no longer reads Wrangler's credential file as a fallback.

Current resolution is:

1. `packages/cli/src/lib/auth.ts` calls `getAuthFromEnv()` from `@cloudflare/workers-auth`, with legacy global-key auth disabled.
2. If no environment token exists, it asks the cf OAuth façade in `packages/cli/src/lib/oauth/index.ts` for a token.
3. `getConfigPath()` asks the active workers-auth credential store for `.path()` at call time; no home-derived token path is captured by cf at module import.

The default OAuth profile is JSON under the canonical Cloudflare config root, for example `<xdg-config>/cloudflare/config/default.json`, not `~/.cf/config.toml`.

## Verification

`packages/wrangler-tests/src/__tests__/logout.test.ts` has three active cases: no credentials, an environment API token, and a real seeded OAuth profile whose refresh token is revoked and whose file is deleted. Its helper computes the profile path only after `runInTempDir()` has installed the test's home/XDG environment.

The unauthenticated `auth whoami` case is also active. Some comments in `whoami.test.ts` still name the removed TOML/token modules, but the executable path uses workers-auth and the test is no longer parked.

## Resolution

The original cf-local lazy-path fix was correct, then became unnecessary when credential ownership moved to `@cloudflare/workers-auth`. The current shared credential store retains runtime path resolution and therefore preserves the fix.
