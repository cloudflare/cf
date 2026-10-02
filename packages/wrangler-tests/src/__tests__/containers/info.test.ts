import { http, HttpResponse } from "msw";
import { describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";

const application = {
	id: "asdf",
	name: "app-test",
	version: 1,
	configuration: { image: "registry.example.com/test-app:v1" },
	scheduling_policy: "regional",
	instances: 2,
};

describe("containers info", () => {
	const std = mockConsoleMethods();
	mockAccountId();
	mockApiToken();

	it.skip("should help");
	it.skip("should show the correct authentication error");
	// cf emits JSON by default and intentionally has no Wrangler --json switch.
	it.skip("should output JSON via --json flag in TTY mode");
	it.skip(
		"should throw JsonFriendlyFatalError on unexpected API error with --json"
	);

	it("should show a single container when given an ID (json)", async ({
		expect,
	}) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId",
				({ params }) => {
					expect(params.accountId).toBe("some-account-id");
					expect(params.applicationId).toBe("asdf");
					return HttpResponse.json(createFetchResult(application));
				},
				{ once: true }
			)
		);
		await runWrangler("containers applications get asdf");
		expect(JSON.parse(std.out)).toEqual(application);
	});

	it("should error when not given an ID", async ({ expect }) => {
		await expect(runWrangler("containers applications get")).rejects.toThrow(
			"Not enough non-option arguments"
		);
	});
});
