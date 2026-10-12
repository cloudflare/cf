import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
} from "vite-plus/test";
import { runCf } from "./helpers/run-cf.js";

/**
 * Runtime regression coverage for the query-param bag, via MSW.
 *
 * `emitPrelude` emits `params` as a plain object literal — every query
 * flag is present, and the ones the user didn't pass are `undefined`.
 * The dry-run preview therefore renders `"query": {}` for a no-filter
 * read, which looks alarming. This test proves that's purely cosmetic:
 * on the wire, the SDK's URL builder drops `undefined`/null/empty query
 * values, so an all-`undefined` `params` produces NO query string.
 *
 * It also pins the dotted-wire-spelling fix at runtime: `--name-exact`
 * must reach the API as `?name.exact=…`, never `?nameExact=…`.
 *
 * A 32-hex `--zone` is treated as an ID and returned verbatim (no zone
 * lookup), so the only outbound request is the list call we intercept.
 */
const ZONE_ID = "023e105f4ecef8ad9ca31a8372d0c353";
const DNS_RECORDS_URL = `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`;

describe("query params on the wire", () => {
	// Isolate cf's global config dir so a developer's stored OAuth token
	// can't satisfy auth and change which requests fire.
	runInTempDir();

	const server = setupServer();
	let lastUrl: URL | undefined;

	beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
	afterEach(() => {
		server.resetHandlers();
		lastUrl = undefined;
	});
	afterAll(() => server.close());

	function interceptList(): void {
		server.use(
			http.get(DNS_RECORDS_URL, ({ request }) => {
				lastUrl = new URL(request.url);
				return HttpResponse.json({
					result: [],
					success: true,
					errors: [],
					messages: [],
				});
			})
		);
	}

	it("sends no query string when no filter flags are passed", async () => {
		interceptList();

		const { exitCode } = await runCf(
			["dns", "records", "list", "--zone", ZONE_ID, "--quiet"],
			{ CLOUDFLARE_API_TOKEN: "test-token" }
		);

		expect(exitCode).toBe(0);
		expect(lastUrl).toBeDefined();
		// The all-`undefined` params literal must NOT leak
		// `?name.exact=undefined&per_page=undefined&…`.
		expect(lastUrl?.search).toBe("");
	});

	it("sends dotted wire keys verbatim when filters are passed", async () => {
		interceptList();

		const { exitCode } = await runCf(
			[
				"dns",
				"records",
				"list",
				"--zone",
				ZONE_ID,
				"--name-exact",
				"foo.example.com",
				"--per-page",
				"5",
				"--quiet",
			],
			{ CLOUDFLARE_API_TOKEN: "test-token" }
		);

		expect(exitCode).toBe(0);
		expect(lastUrl?.searchParams.get("name.exact")).toBe("foo.example.com");
		expect(lastUrl?.searchParams.get("per_page")).toBe("5");
		// The buggy flag-camelCase key must never reach the wire, and
		// unset filters must stay absent.
		expect(lastUrl?.searchParams.has("nameExact")).toBe(false);
		expect(lastUrl?.searchParams.has("name.contains")).toBe(false);
	});
});
