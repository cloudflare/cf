import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end network tests for the default pagination behaviour of list
 * commands (issue cloudflare/cf#20), driven through the real `runMain` →
 * yargs → API client → `globalThis.fetch` stack with MSW standing in for
 * the Cloudflare API.
 *
 * `cf workers list` is documented as "List all Workers for an account",
 * but the generated handler makes a single request and `formatOutput`
 * unwraps the API envelope, dropping `result_info`. On an account with
 * more items than the endpoint's default `per_page`, the printed JSON
 * array therefore looks complete while holding only the first page, and
 * nothing in stdout or stderr tells the caller otherwise.
 *
 * The tests mock a paginated endpoint (46 Workers, 10 per page by
 * default) and assert the contract the issue asks for — the command must
 * either fetch every page, or make the truncation visible so callers can
 * paginate manually. Either fix passes; the current silent single-page
 * output fails.
 *
 * `runInTempDir` isolates HOME/XDG so a developer's real stored OAuth
 * token can't substitute for the fake env token under test, and MSW's
 * `onUnhandledFrame: "error"` guard fails loudly if any request escapes
 * the mocks.
 */

/** Total items the mock account holds. */
const TOTAL_WORKERS = 46;
const TOTAL_NAMESPACES = 49;

const WORKERS = Array.from({ length: TOTAL_WORKERS }, (_, i) => ({
	id: `worker-${i + 1}`,
	created_on: "2026-01-01T00:00:00Z",
}));

const NAMESPACES = Array.from({ length: TOTAL_NAMESPACES }, (_, i) => ({
	id: `ns-${i + 1}`,
	title: `namespace-${i + 1}`,
}));

/**
 * Serve `items` as a page-based list endpoint: reads `page` and `per_page`
 * from the query string (honouring the API's defaults when cf omits them)
 * and returns the Cloudflare envelope with a truthful `result_info`.
 */
function paginated(items: typeof WORKERS | typeof NAMESPACES, defaultPerPage: number) {
	return ({ request }: { request: Request }) => {
		const url = new URL(request.url);
		const page = Math.max(Number(url.searchParams.get("page") ?? 1), 1);
		const perPage = Math.max(
			Number(url.searchParams.get("per_page") ?? defaultPerPage),
			1
		);
		const start = (page - 1) * perPage;
		const result = items.slice(start, start + perPage);
		return HttpResponse.json({
			success: true,
			errors: [],
			messages: [],
			result,
			result_info: {
				page,
				per_page: perPage,
				count: result.length,
				total_count: items.length,
				total_pages: Math.ceil(items.length / perPage),
			},
		});
	};
}

describe("list command default pagination (issue #20)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ACCT = `${TEST_BASE_URL}/accounts/test-account`;

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// formatOutput writes JSON via console.log; capture it, and capture
		// stderr too (a truncation note belongs there or in stdout).
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}

	function stderr(): string {
		return errSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("");
	}

	/**
	 * The issue's contract: with more items than one page, a list command
	 * must either print them all, or make the truncation visible — by
	 * surfacing the continuation metadata (`result_info`, a cursor,
	 * `has_more`) or an explicit "showing N of M" note naming `--page`.
	 */
	function expectNotSilentlyTruncated(
		out: string,
		err: string,
		lastItem: string,
		total: number
	): void {
		const printedEverything = out.includes(lastItem);
		const mentionsContinuation = /result_info|total_count|total_pages|has_more|next_cursor|--page|showing \d+ of/i.test(
			out + "\n" + err
		);
		expect(
			printedEverything || mentionsContinuation,
			`cf printed only the first page of ${total} items with no pagination info in stdout or stderr`
		).toBe(true);
	}

	it("workers list — does not present only the first page as the full list", async () => {
		server.use(
			http.get(`${ACCT}/workers/workers`, paginated(WORKERS, 10))
		);

		const { exitCode } = await runCf(["workers", "list"], ENV);

		expect(exitCode).toBe(0);
		expectNotSilentlyTruncated(
			stdout(),
			stderr(),
			`worker-${TOTAL_WORKERS}`,
			TOTAL_WORKERS
		);
	});

	it("kv namespaces list — does not present only the first page as the full list", async () => {
		server.use(
			http.get(
				`${ACCT}/storage/kv/namespaces`,
				paginated(NAMESPACES, 20)
			)
		);

		const { exitCode } = await runCf(["kv", "namespaces", "list"], ENV);

		expect(exitCode).toBe(0);
		expectNotSilentlyTruncated(
			stdout(),
			stderr(),
			`ns-${TOTAL_NAMESPACES}`,
			TOTAL_NAMESPACES
		);
	});
});
