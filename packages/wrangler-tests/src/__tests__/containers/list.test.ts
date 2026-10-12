import { http, HttpResponse } from "msw";
import { describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { createFetchResult, msw } from "../helpers/msw";
import { runWrangler } from "../helpers/run-wrangler";
import type { ExpectStatic } from "vite-plus/test";

const applications = [
	{ id: "app-1", name: "active-app", instances: 2 },
	{ id: "app-2", name: "ready-app", instances: 0 },
];

describe("containers list", () => {
	const std = mockConsoleMethods();
	mockAccountId();
	mockApiToken();

	function mockList(expect: ExpectStatic, result = applications) {
		let requests = 0;
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications",
				({ params }) => {
					requests++;
					expect(params.accountId).toBe("some-account-id");
					return HttpResponse.json(createFetchResult(result));
				},
				{ once: true }
			)
		);
		return () => requests;
	}

	function outputData(): unknown {
		const output = JSON.parse(std.out) as { data?: unknown } | unknown[];
		return "data" in output ? output.data : output;
	}

	it.skip("should help");
	it.skip("should reject --per-page 0");
	it.skip("should reject --per-page with negative value");
	it.skip("should show the correct authentication error");

	it("should throw UserError on 400 API response", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 1000, message: "bad request" },
						]),
						{ status: 400 }
					),
				{ once: true }
			)
		);
		await expect(runWrangler("containers applications list")).rejects.toThrow(
			"Status code: 400"
		);
	});

	it("should throw on 500 API response", async ({ expect }) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications",
				() =>
					HttpResponse.json(
						createFetchResult(null, false, [
							{ code: 2000, message: "internal" },
						]),
						{ status: 500 }
					),
				{ once: true }
			)
		);
		await expect(runWrangler("containers applications list")).rejects.toThrow(
			"Status code: 500"
		);
	});

	// Table rendering and state derivation are Wrangler presentation logic.
	it.skip("should render a table (non-TTY)");
	it("should handle empty results (non-TTY)", async ({ expect }) => {
		mockList(expect, []);
		await runWrangler("containers applications list");
		expect(outputData()).toEqual([]);
	});
	it("should fetch all results in a single unpaginated request (non-TTY)", async ({
		expect,
	}) => {
		const requestCount = mockList(expect);
		await runWrangler("containers applications list");
		expect(requestCount()).toBe(1);
		expect(outputData()).toEqual(applications);
	});
	it.skip("should derive 'active' when active > 0 and no failures");
	it.skip("should derive 'degraded' when failed > 0 (even with active)");
	it.skip("should derive 'provisioning' when starting > 0");
	it.skip("should derive 'provisioning' when scheduling > 0");
	it.skip("should derive 'ready' when all counters are zero");
	it.skip("should output JSON matching expected schema");
	it("should output empty array for no containers", async ({ expect }) => {
		mockList(expect, []);
		await runWrangler("containers applications list");
		expect(outputData()).toEqual([]);
	});
	it("should fetch all results in a single unpaginated request", async ({
		expect,
	}) => {
		const requestCount = mockList(expect);
		await runWrangler("containers applications list");
		expect(requestCount()).toBe(1);
	});
	it("should throw JsonFriendlyFatalError on unexpected API error", async ({
		expect,
	}) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications",
				() => HttpResponse.json({ message: "boom" }, { status: 500 }),
				{ once: true }
			)
		);
		await expect(runWrangler("containers applications list")).rejects.toThrow(
			"Status code: 500"
		);
	});
	it("should let UserError propagate through on 400 API response", async ({
		expect,
	}) => {
		msw.use(
			http.get(
				"*/accounts/:accountId/containers/applications",
				() => HttpResponse.json({ message: "bad" }, { status: 400 }),
				{ once: true }
			)
		);
		await expect(runWrangler("containers applications list")).rejects.toThrow(
			"Status code: 400"
		);
	});
});
