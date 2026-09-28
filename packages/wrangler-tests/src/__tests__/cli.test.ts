import { describe, test } from "vitest";

describe("cli", () => {
	describe("spinner", () => {
		// wrangler-only: tests the @cloudflare/cli-shared-helpers/interactive
		// spinner output (grayBar/leftT characters, TTY-detection codepath).
		// cf's spinner (packages/cli/src/lib/progress.ts) is structurally
		// different — braille frames via log-update, no output in non-TTY mode.
		// No generic concern to port.
		test.skip("does not animate when stdout is not a TTY");
	});
});
