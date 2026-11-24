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
 * cloudflare/cf#105: a read command whose API envelope carries
 * `result: null` (such as an empty list of short-lived certificate CAs)
 * prints nothing to stdout and exits 0, so `cf ... | jq` fails. A read
 * should always print parseable JSON on stdout.
 */
describe("read command with a null result (#105)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};

	let logSpy: ReturnType<typeof vi.spyOn>;
	let writeSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;
	let errorLogSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		writeSpy = vi.spyOn(process.stdout, "write").mockImplementation(() => true);
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
		errorLogSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		writeSpy.mockRestore();
		errSpy.mockRestore();
		errorLogSpy.mockRestore();
	});

	function stdout(): string {
		return [
			...logSpy.mock.calls.map((c: unknown[]) => String(c[0])),
			...writeSpy.mock.calls.map((c: unknown[]) => String(c[0])),
		].join("\n");
	}

	it("prints parseable JSON for `zero-trust access applications short-lived-certificates list`", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/accounts/test-account/access/apps/ca`, () =>
				HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: null,
				})
			)
		);

		const { exitCode } = await runCf(
			[
				"zero-trust",
				"access",
				"applications",
				"short-lived-certificates",
				"list",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		const out = stdout().trim();
		expect(out).not.toBe("");
		expect(() => JSON.parse(out)).not.toThrow();
	});
});
