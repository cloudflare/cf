import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";
import type { ExpectStatic } from "vitest";

const applicationId = "6925adea-c4ad-4aa6-bffd-d26783e9afbb";

describe("containers delete", () => {
	mockAccountId();
	mockApiToken();

	it.skip("should help");
	it.skip("should reject invalid container ID format");

	async function rejectsStatus(expect: ExpectStatic, status: number) {
		msw.use(
			http.delete(
				"*/accounts/:accountId/containers/applications/:applicationId",
				({ params }) => {
					expect(params.accountId).toBe("some-account-id");
					expect(params.applicationId).toBe(applicationId);
					return HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "something happened" },
						]),
						{ status }
					);
				},
				{ once: true }
			)
		);
		await expect(
			runWrangler(`containers applications delete ${applicationId} --force`)
		).rejects.toThrow(`Status code: ${status}`);
	}

	it("should delete container with 400", ({ expect }) =>
		rejectsStatus(expect, 400));
	it("should delete container with 404", ({ expect }) =>
		rejectsStatus(expect, 404));
	it("should delete container with 500", ({ expect }) =>
		rejectsStatus(expect, 500));

	it("should delete container", async ({ expect }) => {
		msw.use(
			http.delete(
				"*/accounts/:accountId/containers/applications/:applicationId",
				({ params }) => {
					expect(params.accountId).toBe("some-account-id");
					expect(params.applicationId).toBe(applicationId);
					return HttpResponse.json(createFetchResult({}));
				},
				{ once: true }
			)
		);
		await runWrangler(
			`containers applications delete ${applicationId} --force`
		);
	});
});
