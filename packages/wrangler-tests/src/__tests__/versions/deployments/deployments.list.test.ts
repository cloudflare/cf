import { beforeEach, describe, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../../helpers/mock-account-id";
import { mockConsoleMethods } from "../../helpers/mock-console";
import { msw, mswListNewDeployments } from "../../helpers/msw";
import { runInTempDir } from "../../helpers/run-in-tmp";
import { runWrangler } from "../../helpers/run-wrangler";

describe("deployments list", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => msw.use(mswListNewDeployments));

	describe("without wrangler.toml", () => {
		test("fails with no args", async ({ expect }) => {
			await expect(runWrangler("workers deployments list")).rejects.toThrow(
				/Required Worker name missing/
			);
		});

		test("prints deployments to stdout", async ({ expect }) => {
			await runWrangler("workers deployments list --worker test-name");
			expect(JSON.parse(std.out)).toMatchObject({
				deployments: expect.arrayContaining([
					expect.objectContaining({ strategy: "percentage" }),
				]),
			});
		});

		test("prints deployments to stdout as valid json", async ({ expect }) => {
			await runWrangler("workers deployments list --worker test-name");
			expect(() => JSON.parse(std.out)).not.toThrow();
		});
	});

	describe("with wrangler.toml", () => {
		// cf never reads the default Worker export or wrangler.toml.
		test.skip("prints deployments to stdout", async () => {});
		test.skip("prints deployments to stdout as valid json", async () => {});
	});
});
