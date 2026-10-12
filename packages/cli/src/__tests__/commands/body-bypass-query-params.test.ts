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

/**
 * Regression coverage for query parameters on body-bypass and typed SDK paths.
 *
 * `cf kv keys put` has a real octet-stream body plus query parameters. It
 * exercises the generator's raw-body branch and verifies that its query bag is
 * appended to the generated URL. `cf workers secrets delete` covers the same
 * query serialization through a typed Fern call.
 */
describe("--body workaround forwards query params (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const SECRET_URL = `${TEST_BASE_URL}/accounts/test-account/workers/scripts/foo/secrets/my-secret`;
	const KV_URL = `${TEST_BASE_URL}/accounts/test-account/storage/kv/namespaces/ns-1/values/key`;

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

	it("appends query params when a raw body is used", async () => {
		let lastUrl: URL | undefined;
		let body: string | undefined;
		server.use(
			http.put(KV_URL, async ({ request }) => {
				lastUrl = new URL(request.url);
				body = await request.text();
				return HttpResponse.json({ success: true, result: null });
			})
		);

		const { exitCode } = await runCf(
			[
				"kv",
				"keys",
				"put",
				"key",
				"--namespace-id",
				"ns-1",
				"--body",
				"value",
				"--expiration-ttl",
				"60",
				"--quiet",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(lastUrl?.searchParams.get("expiration_ttl")).toBe("60");
		expect(body).toBe("value");
	});

	it("previews the same query and raw body sent by --body", async () => {
		await runCf(
			[
				"kv",
				"keys",
				"put",
				"key",
				"--namespace-id",
				"ns-1",
				"--body",
				"value",
				"--expiration-ttl",
				"60",
				"--dry-run",
			],
			ENV
		);
		const preview = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as {
			query: Record<string, unknown>;
			body: unknown;
			bodyKind: string;
		};
		logSpy.mockClear();

		let requestUrl: URL | undefined;
		let requestBody: string | undefined;
		server.use(
			http.put(KV_URL, async ({ request }) => {
				requestUrl = new URL(request.url);
				requestBody = await request.text();
				return HttpResponse.json({ success: true, result: null });
			})
		);

		await runCf(
			[
				"kv",
				"keys",
				"put",
				"key",
				"--namespace-id",
				"ns-1",
				"--body",
				"value",
				"--expiration-ttl",
				"60",
				"--quiet",
			],
			ENV
		);

		expect(preview.query.expiration_ttl).toBe(
			Number(requestUrl?.searchParams.get("expiration_ttl"))
		);
		expect(preview.bodyKind).toBe("octet-stream");
		expect(preview.body).toBe(requestBody);
	});

	it("forwards the same query param via the non-body SDK path (parity)", async () => {
		// The bodyless command takes the typed Fern path. This pins the same
		// query serialization behavior there.
		let lastUrl: URL | undefined;
		server.use(
			http.delete(SECRET_URL, ({ request }) => {
				lastUrl = new URL(request.url);
				return HttpResponse.json({ success: true, result: null });
			})
		);

		const { exitCode } = await runCf(
			[
				"workers",
				"secrets",
				"delete",
				"my-secret",
				"--worker",
				"foo",
				"--url-encoded",
				"--force",
				"--quiet",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(lastUrl?.searchParams.get("url_encoded")).toBe("true");
	});
});
