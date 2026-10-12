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

describe("cf registrar registrations check", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};

	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});
	afterEach(() => vi.restoreAllMocks());

	it.each([
		{
			root: "registrar",
			domains: ["example.com"],
		},
		{
			root: "registrar-sandbox",
			domains: ["example.com", "example.net"],
		},
	])(
		"sends $root positional domains in the request body",
		async ({ root, domains }) => {
			let body: unknown;
			server.use(
				http.post(
					`${TEST_BASE_URL}/accounts/test-account/${root}/domain-check`,
					async ({ request }) => {
						body = await request.json();
						return HttpResponse.json({ success: true, result: [] });
					}
				)
			);

			const { exitCode } = await runCf(
				[root, "registrations", "check", ...domains],
				ENV
			);

			expect(exitCode).toBe(0);
			expect(body).toEqual({ domains });
		}
	);

	it("previews the body built from positional domains", async () => {
		const { exitCode } = await runCf(
			[
				"registrar",
				"registrations",
				"check",
				"example.com",
				"example.net",
				"--dry-run",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(JSON.parse(String(logSpy.mock.calls[0]?.[0]))).toMatchObject({
			body: { domains: ["example.com", "example.net"] },
			bodyKind: "json",
		});
	});
});
