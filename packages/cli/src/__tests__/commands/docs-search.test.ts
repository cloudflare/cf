import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { buildCli } from "../../index.js";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const SEARCH_URL =
	"https://ai-search.developers.cloudflare.com/api/ai-search/search";
const RESULTS = [
	{
		item: {
			key: "/workers/configuration/cron-triggers/",
			metadata: {
				title: "Cron Triggers",
				description: "Enable your Worker to be executed on a schedule.",
				product: "Workers",
			},
		},
	},
	{
		item: {
			key: "https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/#handle-multiple-cron-triggers",
			metadata: {
				title: "Handle multiple cron triggers",
				description: "Use controller.cron to distinguish which schedule fired.",
			},
		},
	},
];

function respondWith(data: unknown): void {
	server.use(
		http.post(
			SEARCH_URL,
			() =>
				new HttpResponse(JSON.stringify(data), {
					headers: { "Content-Type": "application/json" },
				})
		)
	);
}

describe("cf docs search", () => {
	runInTempDir();
	setupMsw();
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
		vi.stubEnv("CI", "true");
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
	});
	afterEach(() => vi.restoreAllMocks());

	it("searches without authentication and returns ranked JSON with absolute URLs", async () => {
		let body: unknown;
		let headers: Headers | undefined;
		server.use(
			http.post(SEARCH_URL, async ({ request }) => {
				body = await request.json();
				headers = request.headers;
				return HttpResponse.json({
					success: true,
					result: { chunks: RESULTS },
				});
			})
		);
		expect(await runCf(["docs", "search", "schedule a worker"])).toEqual({
			exitCode: 0,
		});
		expect(body).toEqual({
			messages: [{ role: "user", content: "schedule a worker" }],
			stream: false,
			ai_search_options: {
				retrieval: { metadata_only: true, max_num_results: 5 },
			},
		});
		expect(headers?.get("content-type")).toBe("application/json");
		expect(headers?.get("accept")).toBe("application/json");
		expect(headers?.get("authorization")).toBeNull();
		expect(JSON.parse(output.stdout())).toEqual([
			{
				title: "Cron Triggers",
				description: "Enable your Worker to be executed on a schedule.",
				url: "https://developers.cloudflare.com/workers/configuration/cron-triggers/",
			},
			{
				title: "Handle multiple cron triggers",
				description: "Use controller.cron to distinguish which schedule fired.",
				url: "https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/#handle-multiple-cron-triggers",
			},
		]);
	});

	it("returns an empty JSON array for no matches", async () => {
		respondWith({ success: true, result: { chunks: [] } });
		await runCf(["docs", "search", "no matches"]);
		expect(JSON.parse(output.stdout())).toEqual([]);
	});

	it("allows missing display metadata", async () => {
		respondWith({
			success: true,
			result: { chunks: [{ item: { key: "workers/" } }] },
		});
		await runCf(["docs", "search", "workers"]);
		expect(JSON.parse(output.stdout())).toEqual([
			{
				title: "Untitled",
				description: "",
				url: "https://developers.cloudflare.com/workers/",
			},
		]);
	});

	it.each([429, 503])(
		"reports HTTP %i without emitting results",
		async (status) => {
			server.use(
				http.post(SEARCH_URL, () => new HttpResponse(null, { status }))
			);
			await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
				`Cloudflare docs search failed (HTTP ${status}).`
			);
			expect(output.stdout()).toBe("");
		}
	);

	it("reports an unsuccessful search envelope", async () => {
		respondWith({ success: false, error: "invalid search request" });
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Cloudflare docs search failed: invalid search request"
		);
		expect(output.stdout()).toBe("");
	});

	it.each([
		null,
		{ success: true },
		{ success: true, result: { chunks: [{}] } },
		{ success: true, result: { chunks: [{ item: { key: 123 } }] } },
		{ success: true, result: { chunks: [{ item: { key: "" } }] } },
		{
			success: true,
			result: { chunks: [{ item: { key: "workers/", metadata: null } }] },
		},
		{
			success: true,
			result: {
				chunks: [{ item: { key: "workers/", metadata: { title: 123 } } }],
			},
		},
		{
			success: true,
			result: {
				chunks: [{ item: { key: "workers/", metadata: { description: [] } } }],
			},
		},
		{ success: false, error: 123 },
	])("rejects malformed search results: %j", async (data) => {
		respondWith(data);
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Cloudflare docs search returned an invalid response."
		);
		expect(output.stdout()).toBe("");
	});

	it("reports non-JSON responses", async () => {
		server.use(http.post(SEARCH_URL, () => HttpResponse.text("not JSON")));
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Cloudflare docs search returned an invalid JSON response."
		);
		expect(output.stdout()).toBe("");
	});

	it.each([
		"https://example.com/workers/",
		"//example.com/workers/",
		"javascript:alert(1)",
		"https://user:password@developers.cloudflare.com/workers/",
		"http://[invalid",
	])("rejects invalid documentation URLs: %s", async (key) => {
		respondWith({ success: true, result: { chunks: [{ item: { key } }] } });
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Cloudflare docs search returned an invalid URL."
		);
		expect(output.stdout()).toBe("");
	});

	it("reports a network failure", async () => {
		server.use(http.post(SEARCH_URL, () => HttpResponse.error()));
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Unable to reach Cloudflare docs search."
		);
		expect(output.stdout()).toBe("");
	});

	it("reports a search timeout", async () => {
		vi.spyOn(AbortSignal, "timeout").mockReturnValue(
			AbortSignal.abort(new DOMException("Timed out", "TimeoutError"))
		);
		await expect(runCf(["docs", "search", "workers"])).rejects.toThrow(
			"Cloudflare docs search timed out. Try again."
		);
		expect(output.stdout()).toBe("");
	});

	it("previews a dry run without searching or exposing the query", async () => {
		await runCf(["docs", "search", "schedule a worker", "--dry-run"]);
		expect(JSON.parse(output.stdout())).toEqual({
			command: "cf docs search",
			dryRun: true,
			executed: false,
			validated: "arguments only",
		});
	});

	it.each([
		[[], "Not enough non-option arguments"],
		[[" "], "query must not be empty."],
		[["--local", "workers"], "--local is not supported by cf docs."],
	] satisfies [string[], string][])(
		"rejects unusable arguments before searching: %j",
		async (args, message) => {
			await expect(runCf(["docs", "search", ...args])).rejects.toThrow(message);
		}
	);

	it("exposes docs in root help and explains JSON and Markdown in search help", async () => {
		const rootHelp = await buildCli(["--help"]).cli.getHelp();
		expect(rootHelp).toContain("cf docs");
		const help = await buildCli(["docs", "search", "--help"]).cli.getHelp();
		expect(help).toContain("five ranked JSON results");
		expect(help).toContain("Accept: text/markdown");
		expect(help).not.toContain("To inspect the exact API request");
	});

	it("is discoverable through command search and exported tool definitions", async () => {
		await runCf(["cli", "search", "find documentation guides tutorials"]);
		const matches = JSON.parse(output.stdout()) as { command: string }[];
		expect(matches[0]?.command).toBe("cf docs search");
		output.clear();
		await runCf(["tools"]);
		const { tools } = JSON.parse(output.stdout()) as {
			tools: { name: string; inputSchema: unknown; description: string }[];
		};
		expect(tools.find((tool) => tool.name === "cf_docs_search")).toMatchObject({
			inputSchema: {
				properties: { query: { type: "string" } },
				required: ["query"],
			},
			description: expect.stringContaining("Accept: text/markdown"),
		});
	});
});
