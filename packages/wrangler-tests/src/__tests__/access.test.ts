import { describe, it } from "vitest";

// All tests in this file are pure unit tests of wrangler internals
// (`domainUsesAccess`, `getAccessHeaders`, `clearAccessCaches` from
// `../user/access`) that no longer exist now that wrangler source is gone.
// cf has no analogous Access-protected-domain detection for API calls — it
// uses standard Cloudflare API auth via `lib/auth.ts` and doesn't proxy
// through Access-protected endpoints. Skipping the whole describe.
describe("access", () => {
	it.skip("wrangler-only: Cloudflare Access detection for --remote mode");
});
