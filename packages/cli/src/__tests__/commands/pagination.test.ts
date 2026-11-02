import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("pagination metadata (network)", () => {
	runInTempDir();
	setupMsw();
	const output = mockOutputStreams();
	const env = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};
	const accountUrl = `${TEST_BASE_URL}/accounts/test-account`;
	const findings = {
		name: "CASB findings",
		args: ["zero-trust", "casb", "findings", "list"],
		path: "/data-security/posture/findings",
		payload: (page: number) => [{ id: `finding-${page}` }],
	};
	const cases = [
		findings,
		{
			name: "CASB finding instances",
			args: [
				"zero-trust",
				"casb",
				"findings",
				"instances",
				"list",
				"--finding-id",
				"finding-1",
			],
			path: "/data-security/posture/findings/finding-1/instances",
			payload: (page: number) => [{ id: `instance-${page}` }],
		},
		{
			name: "CASB policies",
			args: ["zero-trust", "casb", "policies", "list"],
			path: "/data-security/posture/policies",
			payload: (page: number) => [{ id: `policy-${page}` }],
		},
		{
			name: "KV keys",
			args: ["kv", "keys", "list", "--namespace-id", "namespace-1"],
			path: "/storage/kv/namespaces/namespace-1/keys",
			payload: (page: number) => [{ name: `key-${page}` }],
		},
		{
			name: "R2 buckets",
			args: ["r2", "buckets", "list"],
			path: "/r2/buckets",
			payload: (page: number) => ({ buckets: [{ name: `bucket-${page}` }] }),
		},
	];

	function paginationInfo(): { cursor: string | null } {
		const line = output.err
			.split("\n")
			.find((entry) => entry.startsWith("result_info: "));
		expect(line).toBeDefined();
		return JSON.parse(line?.slice("result_info: ".length) ?? "");
	}

	it.each(cases)(
		"$name exposes a reusable cursor without changing stdout",
		async ({ args, path, payload }) => {
			const cursor = "next+/page=token&value%";
			const requests: (string | null)[] = [];
			server.use(
				http.get(`${accountUrl}${path}`, ({ request }) => {
					const received = new URL(request.url).searchParams.get("cursor");
					requests.push(received);
					expect(received === null || received === cursor).toBe(true);
					return HttpResponse.json({
						success: true,
						result: payload(received === null ? 1 : 2),
						result_info: { cursor: received === null ? cursor : null },
					});
				})
			);

			expect(await runCf(args, env)).toEqual({ exitCode: 0 });
			expect(JSON.parse(output.out)).toEqual(payload(1));
			const next = paginationInfo().cursor;
			expect(next).toBe(cursor);
			expect(requests).toEqual([null]);

			output.getAndClearOut();
			output.getAndClearErr();
			expect(await runCf([...args, "--cursor", String(next)], env)).toEqual({
				exitCode: 0,
			});
			expect(JSON.parse(output.out)).toEqual(payload(2));
			expect(paginationInfo().cursor).toBeNull();
			expect(requests).toEqual([null, cursor]);
		}
	);

	it("prints offset metadata while leaving stdout as an array", async () => {
		const info = { page: 1, per_page: 5, count: 1, total_count: 101 };
		server.use(
			http.get(`${accountUrl}${findings.path}`, ({ request }) => {
				const query = new URL(request.url).searchParams;
				expect(query.get("page")).toBe("1");
				expect(query.get("per_page")).toBe("5");
				return HttpResponse.json({
					success: true,
					result: findings.payload(1),
					result_info: info,
				});
			})
		);

		expect(
			await runCf([...findings.args, "--page", "1", "--per-page", "5"], env)
		).toEqual({ exitCode: 0 });
		expect(JSON.parse(output.out)).toEqual(findings.payload(1));
		expect(paginationInfo()).toEqual(info);
	});

	it("--quiet suppresses pagination notices while retaining the payload", async () => {
		server.use(
			http.get(`${accountUrl}${findings.path}`, () =>
				HttpResponse.json({
					success: true,
					result: findings.payload(1),
					result_info: { cursor: "next-page" },
				})
			)
		);

		expect(await runCf([...findings.args, "--quiet"], env)).toEqual({
			exitCode: 0,
		});
		expect(JSON.parse(output.out)).toEqual(findings.payload(1));
		expect(output.err).not.toContain("result_info");
	});
});
