import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const SEARCH_URL =
	"https://ai-search.developers.cloudflare.com/api/ai-search/search";

const telemetry = vi.hoisted(() => ({
	enabled: true,
	events: [] as Array<{ name: string; properties: Record<string, unknown> }>,
}));

vi.mock("../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: telemetry.enabled,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetry.events.push({ name, properties }),
		sendAdhocEvent: () => {},
	}),
}));

describe("cf docs search telemetry", () => {
	setupMsw();

	beforeEach(() => {
		captureOutput();
		telemetry.enabled = true;
		telemetry.events.length = 0;
		server.use(
			http.post(SEARCH_URL, () =>
				HttpResponse.json({ success: true, result: { chunks: [] } })
			)
		);
	});

	it("records the query only on the finished event without generic arguments", async () => {
		await runCf(["docs", "search", "schedule a worker"]);
		expect(telemetry.events).toHaveLength(2);
		expect(telemetry.events[0]).toMatchObject({
			name: "cf command started",
			properties: { command: "docs search" },
		});
		expect(telemetry.events[0]?.properties).not.toHaveProperty("searchQuery");
		expect(telemetry.events[1]).toMatchObject({
			name: "cf command finished",
			properties: {
				command: "docs search",
				outcome: "success",
				searchQuery: "schedule a worker",
				sanitizedArgs: {},
				argsUsed: [],
				argsCombination: "",
			},
		});
	});

	it("records the query when the search fails", async () => {
		server.use(
			http.post(SEARCH_URL, () => new HttpResponse(null, { status: 503 }))
		);
		await expect(
			runCf(["docs", "search", "schedule a worker"])
		).rejects.toThrow("Cloudflare docs search failed (HTTP 503).");
		expect(telemetry.events).toHaveLength(2);
		expect(telemetry.events[1]).toMatchObject({
			name: "cf command finished",
			properties: {
				command: "docs search",
				outcome: "error",
				searchQuery: "schedule a worker",
			},
		});
	});

	it("limits telemetry queries without truncating the search request", async () => {
		const query = "x".repeat(1100);
		let requestBody: unknown;
		server.use(
			http.post(SEARCH_URL, async ({ request }) => {
				requestBody = await request.json();
				return HttpResponse.json({ success: true, result: { chunks: [] } });
			})
		);
		await runCf(["docs", "search", query]);
		expect(requestBody).toMatchObject({
			messages: [{ role: "user", content: query }],
		});
		expect(telemetry.events[1]?.properties).toMatchObject({
			searchQuery: "x".repeat(1024),
			searchQueryTruncated: true,
		});
	});

	it("honors telemetry opt-out", async () => {
		telemetry.enabled = false;
		await runCf(["docs", "search", "schedule a worker"]);
		expect(telemetry.events).toEqual([]);
	});
});
