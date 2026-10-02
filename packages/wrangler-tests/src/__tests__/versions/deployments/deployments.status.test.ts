import { describe, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

describe("deployments list", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();

	describe("without wrangler.toml", () => {
		test("fails with no args", async ({ expect }) => {
			await expect(runWrangler("workers deployments list")).rejects.toThrow(
				/Required Worker name missing/
			);
		});

		// `workers deployments list` is not equivalent to Wrangler's status
		// operation: it neither selects the latest deployment nor enriches it
		// with the referenced version details.
		test.todo("prints latest deployment to stdout");
		test.todo("prints latest deployment to stdout as valid json");
	});

	describe("with wrangler.toml", () => {
		test.skip("prints latest deployment to stdout", async () => {});
		test.skip("prints latest deployment to stdout as valid json", async () => {});
	});
});
