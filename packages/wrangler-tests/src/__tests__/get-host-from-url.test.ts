import { describe, it } from "vite-plus/test";

// Tests wrangler's internal `getHostFromUrl` helper from `../zones`. That
// module doesn't exist in cf — zone/host parsing is forge-side (the API
// accepts the wildcard form directly) and isn't exposed as a CLI helper.
// Out of scope for the wrangler-tests corpus.
describe.skip("getHostFromUrl", () => {
	it("should return the host from a url", () => {});

	it("should return the host from a url using wildcard *.", () => {});

	it("should return the host from a url using wildcard *", () => {});
});
