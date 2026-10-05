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
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("cf workers list (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	it("warns about later pages without changing JSON stdout", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/accounts/test-account/workers/workers`, () =>
				HttpResponse.json({
					success: true,
					result: Array.from({ length: 10 }, (_, id) => ({ id })),
					result_info: {
						page: 1,
						per_page: 10,
						count: 10,
						total_count: 46,
					},
				})
			)
		);

		const { exitCode } = await runCf(["workers", "list", "-q"], ENV);

		expect(exitCode).toBe(0);
		expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toHaveLength(10);
		expect(
			errSpy.mock.calls.map((call: unknown[]) => String(call[0])).join("")
		).toContain(
			"Showing 10 of 46 results (page 1 of 5); use --page 2 for more."
		);
	});
});
