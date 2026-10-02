import { describe, it } from "vite-plus/test";

// cf's help format differs from wrangler's (different prose, no
// COMMANDS/GLOBAL FLAGS sections in the wrangler shape, no `wrangler r2`
// header). Inline-snapshot help-text tests are inherently wrangler-only —
// they assert on wrangler's exact help rendering, which cf does not
// reproduce. Mark the whole describe as `.skip`.
describe("r2", () => {
	describe("help", () => {
		it.skip("should show help when no argument is passed");

		it.skip("should show help when an invalid argument is passed");
	});
});
