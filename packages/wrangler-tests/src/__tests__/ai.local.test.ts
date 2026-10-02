import { describe, it } from "vite-plus/test";

// Skipped: the `local` block in this file exercises wrangler's
// `--local` mode for AI (miniflare-backed `getAIFetcher` that proxies
// `ai/run/proxy` requests with an `X-Forwarded` header). cf's local mode
// routes generated API requests through Miniflare's explorer; it has no
// `getAIFetcher` equivalent, and the hand-written `ai run` command rejects
// `--local` before dynamic schema discovery. These header-level tests remain
// coupled to Wrangler's internal proxy implementation.
//
// The sibling `403 auth error handling` block from the original file
// also targets the wrangler-only `getAIFetcher` codepath — its
// auth-error logging hint references `wrangler login` and lives on
// the wrangler `logger` import, neither of which has a cf equivalent
// (cf surfaces 401/403 hints via `lib/errors.ts` at the SDK layer,
// not via a per-product fetcher). Skipped along with the rest.
describe("ai", () => {
	describe("fetcher", () => {
		describe("local", () => {
			it.skip("should send x-forwarded header");
			it.skip("account id should be set");
		});

		describe("403 auth error handling", () => {
			it.skip("should log error on 403 with auth error code 1031");
			it.skip("should not log error on 403 without auth error code 1031");
			it.skip("should not throw on 403 with unparseable body");
		});
	});
});
