import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";

const applicationId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";
const instance = {
	application_id: applicationId,
	id: "11111111-1111-1111-1111-111111111111",
	image: "registry.example.com/example:latest",
	status: {
		state: "running",
		updated_at: "2025-06-01T10:00:00Z",
	},
};

describe("containers instances", () => {
	const std = mockConsoleMethods();
	mockAccountId();
	mockApiToken();

	async function runList(): Promise<unknown> {
		await runWrangler(
			`containers applications instances list --application-id ${applicationId}`
		);
		return JSON.parse(std.out);
	}

	it.skip("should help");
	it.skip("should show the correct authentication error");
	it.skip("should render a table (non-TTY)");
	it.skip("should render DO instance table (non-TTY)");
	it.todo("should reject --per-page 0");
	it.todo("should reject --per-page with negative value");
	it.skip("should error on invalid ID format");
	it("should error on missing ID", async ({ expect }) => {
		await expect(
			runWrangler("containers applications instances list")
		).rejects.toThrow(/required argument: application-id/i);
	});

	it("should handle empty instance list", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				() => HttpResponse.json(createFetchResult([])),
				{ once: true }
			)
		);
		const output = await runList();
		expect(output).toBeDefined();
	});

	it("should fetch all results in a single unpaginated request (non-TTY)", async ({
		expect,
	}) => {
		let requests = 0;
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				({ request }) => {
					requests++;
					const url = new URL(request.url);
					expect(url.searchParams.has("per_page")).toBe(false);
					expect(url.searchParams.has("page_token")).toBe(false);
					return HttpResponse.json(createFetchResult([instance]));
				},
				{ once: true }
			)
		);
		await runList();
		expect(requests).toBe(1);
	});

	// Search and table/JSON mode switching are Wrangler client-side features.
	it.skip("should reject a page token without JSON output");
	it.skip("should find an instance by exact ID across every page");
	it.skip("should find an instance by exact name in JSON output");
	it.skip("should explain when no exact human-readable match is found");
	it.skip("should return an empty JSON result when no exact match is found");
	it.skip("should return every instance with the same exact name");
	it.skip("should preserve the complete top-level array for non-DO apps");
	it.skip("should include name field for DO-backed apps");

	it("should output empty array for no instances", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				() => HttpResponse.json(createFetchResult([], true, [], [], {})),
				{ once: true }
			)
		);
		const output = await runList();
		expect(output).toEqual([]);
	});

	// The generated SDK currently unwraps the response's `result` and discards
	// the top-level `result_info`, so cf cannot expose the continuation token.
	it.todo("should return one page and its continuation metadata");

	it("should continue from an explicit page token", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				({ request }) => {
					const query = new URL(request.url).searchParams;
					expect(query.get("per_page")).toBe("1");
					expect(query.get("page_token")).toBe("next-page");
					return HttpResponse.json(createFetchResult([instance]));
				},
				{ once: true }
			)
		);
		await runWrangler(
			`containers applications instances list --application-id ${applicationId} --per-page 1 --page-token next-page`
		);
	});

	it("should continue with a page token without sending a default page size", async ({
		expect,
	}) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				({ request }) => {
					const query = new URL(request.url).searchParams;
					expect(query.has("per_page")).toBe(false);
					expect(query.get("page_token")).toBe("next-page");
					return HttpResponse.json(createFetchResult([instance]));
				},
				{ once: true }
			)
		);
		await runWrangler(
			`containers applications instances list --application-id ${applicationId} --page-token next-page`
		);
	});

	it("should support APIs that return the complete list without pagination metadata", async ({
		expect,
	}) => {
		let requests = 0;
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications/:applicationId/instances-v2",
				() => {
					requests++;
					return HttpResponse.json(createFetchResult([instance]));
				},
				{ once: true }
			)
		);
		await runList();
		expect(requests).toBe(1);
	});
});
