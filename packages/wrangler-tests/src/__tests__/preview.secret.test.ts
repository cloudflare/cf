import { describe, it } from "vitest";

// Out of scope for cf: cf has no `preview` surface. It does not read project
// Worker config and delegates development behavior to dev-server implementations.
// The wrangler `preview secret put|delete|list|bulk` commands manage
// `preview_defaults.env` on a worker via PATCH /workers/workers/:id and have
// no equivalent in cf today.
describe("wrangler preview", () => {
	describe("preview secret", () => {
		it.skip("wrangler-only: preview-script secret CRUD");
	});
});
