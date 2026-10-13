import { describe, it } from "vite-plus/test";

// All tests in this file exercise wrangler's `docs` command, which uses
// Algolia's `developers-cloudflare2` index to resolve search terms to
// docs URLs and then opens the result in a browser via wrangler's
// internal `../open-in-browser` module. `cf docs search` instead uses
// the docs site's AI Search endpoint and returns JSON without opening
// a browser. Its tests live in packages/cli; these browser-opening
// compatibility cases remain skipped.
describe.skip("wrangler docs", () => {
	it.skip("--help");
	it.skip("opens a browser to Cloudflare docs when given no search term");
	it.skip("opens a browser to Cloudflare docs when given a single search term");
	it.skip(
		"opens a browser to Cloudflare docs when given multiple search terms"
	);
});
