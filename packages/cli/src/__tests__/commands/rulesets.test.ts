import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	createFetchResult,
	server,
	setupMsw,
	TEST_BASE_URL,
} from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * End-to-end network tests for `cf rulesets create` and
 * `cf rulesets entrypoint update`, driven through the real
 * `runMain` → yargs → API client → `globalThis.fetch` stack with MSW
 * standing in for the Cloudflare API.
 *
 * The Rulesets API assigns ruleset IDs itself: it accepts neither a
 * required `id` on `POST /zones/{zone_id}/rulesets` nor on
 * `PUT /zones/{zone_id}/rulesets/phases/{phase}/entrypoint`, and rejects
 * the field outright (`invalid JSON: unknown field "id"`, 400). So a
 * ruleset must be creatable without any `--id` flag, and the request
 * body must never contain an `id` field (see cloudflare/cf#458).
 */
describe("cf rulesets (network)", () => {
	runInTempDir();
	setupMsw();

	const ENV = {
		CI: "true",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const ZONE_ID = "0123456789abcdef0123456789abcdef";
	const RULES = JSON.stringify([
		{
			description: "nosniff",
			expression: "true",
			action: "rewrite",
			action_parameters: {
				headers: {
					"X-Content-Type-Options": {
						operation: "set",
						value: "nosniff",
					},
				},
			},
		},
	]);

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

	it("create — works without --id and never sends an id in the body", async () => {
		const bodies: Record<string, unknown>[] = [];
		server.use(
			http.post(
				`${TEST_BASE_URL}/zones/${ZONE_ID}/rulesets`,
				async ({ request }) => {
					bodies.push((await request.json()) as Record<string, unknown>);
					return HttpResponse.json(
						createFetchResult({ id: "assigned-by-api", name: "default" })
					);
				}
			)
		);

		const { exitCode } = await runCf(
			[
				"rulesets",
				"create",
				"--zone",
				ZONE_ID,
				"--kind",
				"zone",
				"--phase",
				"http_response_headers_transform",
				"--name",
				"default",
				"--rules",
				RULES,
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(bodies).toHaveLength(1);
		expect(bodies[0]).not.toHaveProperty("id");
		expect(bodies[0]).toMatchObject({ kind: "zone", name: "default" });
	});

	it("entrypoint update — works without --id and never sends an id in the body", async () => {
		const bodies: Record<string, unknown>[] = [];
		server.use(
			http.put(
				`${TEST_BASE_URL}/zones/${ZONE_ID}/rulesets/phases/http_response_headers_transform/entrypoint`,
				async ({ request }) => {
					bodies.push((await request.json()) as Record<string, unknown>);
					return HttpResponse.json(
						createFetchResult({ id: "assigned-by-api", name: "default" })
					);
				}
			)
		);

		const { exitCode } = await runCf(
			[
				"rulesets",
				"entrypoint",
				"update",
				"http_response_headers_transform",
				"--zone",
				ZONE_ID,
				"--name",
				"default",
				"--rules",
				RULES,
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(bodies).toHaveLength(1);
		expect(bodies[0]).not.toHaveProperty("id");
		expect(bodies[0]).toMatchObject({ name: "default" });
	});
});
