import { describe, it } from "vitest";

// SKIP: cf has no `isLocal` helper — wrangler's `--local` / `--remote` flag
// resolution is internal to its dev-server. cf instead has one global `--local`
// flag that starts Miniflare and routes API requests through the explorer, so
// this precedence-table unit test of `../utils/is-local` does not apply.
describe("isLocal", () => {
	it.skip("wrangler-only: --local / --remote precedence resolution");
});
