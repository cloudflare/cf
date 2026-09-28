import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";

describe("pages project list", () => {
	mockAccountId();
	mockApiToken();
	const std = mockConsoleMethods();

	it("should return JSON output when --json flag is provided", async ({
		expect,
	}) => {
		const projects = [{ name: "example-project" }];
		msw.use(
			http.get(
				"*/accounts/:accountId/pages/projects",
				() =>
					HttpResponse.json(
						createFetchResult(projects, true, [], [], {
							page: 1,
							per_page: 20,
						})
					),
				{ once: true }
			)
		);

		// cf emits JSON without requiring a --json switch.
		await runWrangler("pages projects list");
		expect(JSON.parse(std.out)).toEqual(projects);
	});
});
