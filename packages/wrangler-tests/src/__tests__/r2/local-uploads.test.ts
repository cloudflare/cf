import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("r2 bucket local-uploads", () => {
	const std = mockConsoleMethods();

	runInTempDir();
	mockAccountId();
	mockApiToken();

	describe("get", () => {
		it("should display enabled status when local uploads is enabled", async () => {
			msw.use(
				http.get(
					"*/accounts/:accountId/r2/buckets/:bucketName/local-uploads",
					async ({ params }) => {
						const { accountId, bucketName } = params;
						expect(accountId).toEqual("some-account-id");
						expect(bucketName).toEqual("my-bucket");
						return HttpResponse.json(createFetchResult({ enabled: true }));
					},
					{ once: true }
				)
			);

			await runWrangler("r2 buckets local-uploads get my-bucket");
			expect(JSON.parse(std.out)).toEqual({ enabled: true });
		});

		it("should display disabled status when local uploads is disabled", async () => {
			msw.use(
				http.get(
					"*/accounts/:accountId/r2/buckets/:bucketName/local-uploads",
					async ({ params }) => {
						const { accountId, bucketName } = params;
						expect(accountId).toEqual("some-account-id");
						expect(bucketName).toEqual("my-bucket");
						return HttpResponse.json(createFetchResult({ enabled: false }));
					},
					{ once: true }
				)
			);

			await runWrangler("r2 buckets local-uploads get my-bucket");
			expect(JSON.parse(std.out)).toEqual({ enabled: false });
		});

		it("should error if bucket name is not provided", async () => {
			await expect(() =>
				runWrangler("r2 buckets local-uploads get")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Not enough non-option arguments: got 0, need at least 1]`
			);
		});
	});

	describe("update", () => {
		it("should enable local uploads with confirmation", async () => {
			msw.use(
				http.put(
					"*/accounts/:accountId/r2/buckets/:bucketName/local-uploads",
					async ({ request, params }) => {
						const { accountId, bucketName } = params;
						expect(accountId).toEqual("some-account-id");
						expect(bucketName).toEqual("my-bucket");
						const body = (await request.json()) as { enabled: boolean };
						expect(body.enabled).toEqual(true);
						return HttpResponse.json(createFetchResult({ enabled: true }));
					},
					{ once: true }
				)
			);

			await runWrangler("r2 buckets local-uploads update my-bucket --enabled");
			expect(JSON.parse(std.out)).toEqual({ enabled: true });
		});

		it("should disable local uploads with confirmation", async () => {
			msw.use(
				http.put(
					"*/accounts/:accountId/r2/buckets/:bucketName/local-uploads",
					async ({ request, params }) => {
						const { accountId, bucketName } = params;
						expect(accountId).toEqual("some-account-id");
						expect(bucketName).toEqual("my-bucket");
						const body = (await request.json()) as { enabled: boolean };
						expect(body.enabled).toEqual(false);
						return HttpResponse.json(createFetchResult({ enabled: false }));
					},
					{ once: true }
				)
			);

			await runWrangler(
				"r2 buckets local-uploads update my-bucket --no-enabled"
			);
			expect(JSON.parse(std.out)).toEqual({ enabled: false });
		});

		it("should error if bucket name is not provided", async () => {
			await expect(() =>
				runWrangler("r2 buckets local-uploads update")
			).rejects.toThrowErrorMatchingInlineSnapshot(
				`[Error: Not enough non-option arguments: got 0, need at least 1]`
			);
		});
	});

	// Wrangler-only UX: bespoke enable/disable verbs, confirmation prompts,
	// --force / -y flags, splash banner, and prose-style output formatting.
	describe.skip("wrangler-only UX", () => {
		describe("help", () => {
			it("should show help when the local-uploads command is passed", async () => {});
		});

		describe("enable", () => {
			it("should enable local uploads with confirmation", async () => {});
			it("should enable local uploads with --force flag without confirmation", async () => {});
			it("should enable local uploads with -y flag without confirmation", async () => {});
			it("should cancel enable when confirmation is declined", async () => {});
			it("should error if bucket name is not provided", async () => {});
		});

		describe("disable", () => {
			it("should disable local uploads with confirmation", async () => {});
			it("should disable local uploads with --force flag without confirmation", async () => {});
			it("should disable local uploads with -y flag without confirmation", async () => {});
			it("should cancel disable when confirmation is declined", async () => {});
			it("should error if bucket name is not provided", async () => {});
		});
	});
});
