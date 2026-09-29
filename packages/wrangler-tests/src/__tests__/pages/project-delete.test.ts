import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";

describe("pages project delete", () => {
	mockAccountId();
	mockApiToken();

	it("should delete a project without asking if --yes provided", async ({
		expect,
	}) => {
		let requests = 0;
		msw.use(
			http.delete(
				"*/accounts/:accountId/pages/projects/:projectName",
				({ params }) => {
					requests++;
					expect(params.projectName).toBe("example-project");
					return HttpResponse.json(createFetchResult(null));
				},
				{ once: true }
			)
		);

		// cf calls Wrangler's --yes-equivalent confirmation bypass --force.
		await runWrangler("pages delete example-project --force");
		expect(requests).toBe(1);
	});
});
