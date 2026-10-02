import { http, HttpResponse } from "msw";
import { beforeEach, describe, test } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw, mswListVersions } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("versions list", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => msw.use(mswListVersions));

	describe("without wrangler.toml", () => {
		test("fails with no args", async ({ expect }) => {
			await expect(runWrangler("workers versions list")).rejects.toThrow(
				/Missing required argument: worker-id/
			);
		});

		test("prints versions to stdout", async ({ expect }) => {
			await runWrangler("workers versions list --worker-id test-name");
			const output = JSON.parse(std.out) as { items: Array<{ id: string }> };
			expect(output.items).toHaveLength(4);
		});

		test("prints versions to stdout as valid json", async ({ expect }) => {
			await runWrangler("workers versions list --worker-id test-name");
			expect(() => JSON.parse(std.out)).not.toThrow();
		});

		test("prints the 10 most recent versions to stdout as valid json", async ({
			expect,
		}) => {
			msw.use(
				http.get(
					"*/accounts/:accountId/workers/workers/:workerId/versions",
					({ request }) => {
						const url = new URL(request.url);
						expect(url.searchParams.get("per_page")).toBe("10");
						return HttpResponse.json(
							createFetchResult({
								items: Array.from({ length: 10 }, (_, index) => ({
									id: `version-${index}`,
								})),
							})
						);
					},
					{ once: true }
				)
			);
			await runWrangler(
				"workers versions list --worker-id test-name --per-page 10"
			);
			const output = JSON.parse(std.out) as { items: unknown[] };
			expect(output.items).toHaveLength(10);
		});
	});

	describe("with wrangler.toml", () => {
		test.skip("prints versions to stdout", async () => {});
		test.skip("prints versions as valid json", async () => {});
	});
});
