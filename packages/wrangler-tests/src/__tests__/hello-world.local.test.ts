import { describe, it } from "vitest";

// Skipped: every test in this file exercises wrangler's `--local` mode
// for the `hello-world` template command (miniflare-backed local KV
// simulator for `wrangler hello-world get`/`set`). `wrangler hello-world`
// is a starter-template scaffold, not an API endpoint — cf will never have
// an equivalent command. Even after `cf --local` lands, these tests remain
// inapplicable.
describe("hello-world", () => {
	describe("local", () => {
		it.skip("should support get and set local storage");
	});
});
