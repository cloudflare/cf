import { http, HttpResponse } from "msw";
import { describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";

describe("containers ssh", () => {
	mockAccountId();
	mockApiToken();

	it.skip("should help");
	// The current Forge OpenAPI schema does not include the SSH JWT endpoint.
	// Keep these Wrangler compatibility tests skipped until it is restored.
	it.skip("should let the API validate invalid container ID format", async ({
		expect,
	}) => {
		let requestedId: string | undefined;
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/instances/:instanceId/ssh",
				({ params }) => {
					requestedId = String(params.instanceId);
					return HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "INVALID_INSTANCE_ID" },
						]),
						{ status: 400 }
					);
				},
				{ once: true }
			)
		);
		await expect(
			runWrangler("containers instances ssh invalid-id")
		).rejects.toThrow("Status code: 400");
		expect(requestedId).toBe("invalid-id");
	});

	it.skip("should handle 500s when getting ssh jwt", async ({ expect }) => {
		const instanceId = "a".repeat(64);
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/instances/:instanceId/ssh",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "something happened" },
						]),
						{ status: 500 }
					),
				{ once: true }
			)
		);
		await expect(
			runWrangler(`containers instances ssh ${instanceId}`)
		).rejects.toThrow("Status code: 500");
	});
	it.skip("should try ssh'ing into a container");
	it.skip("should proxy stdin and stdout when stdio is forced");
	it.skip(
		"should auto-detect proxy mode with extra args when stdin and stdout are not TTYs"
	);
});
