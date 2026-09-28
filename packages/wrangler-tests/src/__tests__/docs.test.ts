import { describe, it } from "vitest";

// All tests in this file exercise wrangler's `docs` command, which uses
// Algolia's `developers-cloudflare2` index to resolve search terms to
// docs URLs and then opens the result in a browser via wrangler's
// internal `../open-in-browser` module. cf has no `docs` command —
// this is a wrangler-only affordance for command discovery, not part
// of the API surface that cf generates from forge. Skipping the whole
// describe.
describe.skip("wrangler docs", () => {
	it.skip("--help");
	it.skip("opens a browser to Cloudflare docs when given no search term");
	it.skip("opens a browser to Cloudflare docs when given a single search term");
	it.skip(
		"opens a browser to Cloudflare docs when given multiple search terms"
	);
});
