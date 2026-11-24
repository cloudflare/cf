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
 * Regression tests for cloudflare/cf#209: the R2 object key's help text says
 * slashes "MUST be sent literally and MUST NOT be percent-encoded (i.e.
 * `%2F`)", but `cf r2 objects delete folder/a.txt` sends
 * `.../objects/folder%2Fa.txt`, so the delete misses the object and still
 * exits 0.
 */
describe("cf r2 objects delete with a key containing '/'", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const OBJECTS = `${TEST_BASE_URL}/accounts/test-account/r2/buckets/assets/objects`;

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

	it("sends the slash literally in the request path", async () => {
		let requestUrl: string | undefined;
		server.use(
			http.delete(`${OBJECTS}/*`, ({ request }) => {
				requestUrl = request.url;
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: {},
				});
			})
		);

		const { exitCode } = await runCf(
			[
				"r2",
				"objects",
				"delete",
				"folder/a.txt",
				"--bucket-name",
				"assets",
				"--force",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(requestUrl).toBe(`${OBJECTS}/folder/a.txt`);
	});

	it("shows the slash literally in --dry-run", async () => {
		await runCf(
			[
				"r2",
				"objects",
				"delete",
				"folder/a.txt",
				"--bucket-name",
				"assets",
				"--dry-run",
			],
			ENV
		);

		const out = logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
		expect(out).toContain("/r2/buckets/assets/objects/folder/a.txt");
		expect(out).not.toContain("folder%2Fa.txt");
	});
});
