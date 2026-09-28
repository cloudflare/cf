import { describe, it } from "vitest";

// Tests wrangler's `tunnel/client.ts` `resolveTunnelId` helper, which
// accepts either a UUID or a tunnel name and resolves the latter via
// the SDK's `zeroTrust.tunnels.cloudflared.list` endpoint. cf doesn't
// expose this helper — name-or-id resolution for Cloudflare Tunnels is
// handled either by the user passing the UUID directly to forge-
// generated `cf zero-trust tunnels cloudflared {get,delete,...}`
// commands, or (in future, if added as a forge `paramOverride.derive`
// primitive) by a generic name→id lookup. There
// is no `tunnel/client.ts` in cf. Out of scope for the wrangler-tests
// corpus.

describe("resolveTunnelId", () => {
	it.skip("returns UUID input without calling API");

	it.skip("resolves a unique tunnel name via SDK list");

	it.skip("resolves a named tunnel target from matching ingress rules");

	it.skip("throws when a named tunnel has no ingress for the local port");

	it.skip(
		"shows compact setup guidance when a named tunnel has no ingress rules"
	);
});
