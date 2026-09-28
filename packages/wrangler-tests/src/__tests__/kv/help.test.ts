import { afterEach, beforeEach, describe, it, test } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { clearDialogs } from "../helpers/mock-dialogs";
import { useMockIsTTY } from "../helpers/mock-istty";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("kv", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	const { setIsTTY } = useMockIsTTY();
	beforeEach(() => {
		setIsTTY(true);
	});
	afterEach(() => {
		clearDialogs();
	});

	// cf's help format is yargs-native (same renderer wrangler uses)
	// but with brand-orange section headers and a different banner.
	// Help-text snapshots are wrangler-only — skipping the entire
	// suite for cf.
	describe("help", () => {
		test.skip("kv --help");

		it.skip("should show help when no argument is passed");

		it("should show help when an invalid argument is passed", async ({
			expect,
		}) => {
			await expect(() => runWrangler("kv asdf")).rejects.toThrow(
				/Unknown (?:argument|command)/i
			);
		});
	});
});
