import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

/**
 * Regression coverage for cloudflare/cf#180.
 *
 * `POST .../artifacts/namespaces/{namespace}/repos/{name}/fork` takes the
 * source repository as the `{name}` path parameter and the new repository's
 * name as a required `name` body field. The generator derives the `name`
 * flag for the path parameter first, then silently skips the body field of
 * the same natural flag name, so the fork command has no way to name the
 * target repository and every flag-built request is rejected by the API.
 */
describe("cf artifacts namespaces repos fork (cloudflare/cf#180)", () => {
	runInTempDir();
	setupMsw();
	afterEach(() => vi.restoreAllMocks());

	const ENV = {
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
		CLOUDFLARE_ACCOUNT_ID: "test-account",
	};
	const FORK_URL = `${TEST_BASE_URL}/accounts/test-account/artifacts/namespaces/spike/repos/ingress-probe/fork`;

	async function forkSchema() {
		const output = captureOutput();
		await expect(
			runCf(["schema", "artifacts", "namespaces", "repos", "fork"])
		).resolves.toEqual({ exitCode: 0 });
		return JSON.parse(output.stdout()) as {
			pathParams: { name: string; flag?: string; positional?: boolean }[];
			requestBodyFields: { name: string; required: boolean }[];
		};
	}

	it("lists a required body flag for the target repository name", async () => {
		const schema = await forkSchema();
		// The source repository stays the positional path parameter.
		expect(schema.pathParams).toContainEqual(
			expect.objectContaining({ name: "name", positional: true })
		);
		// The OpenAPI body requires `name`; it must have a flag of its own.
		expect(schema.requestBodyFields).toContainEqual(
			expect.objectContaining({ required: true })
		);
	});

	it("sends the target repository name in the body, keeping the source in the path", async () => {
		const schema = await forkSchema();
		const known = new Set(["default-branch-only", "description", "read-only"]);
		const targetFlag = schema.requestBodyFields.find(
			(field) => !known.has(field.name)
		)?.name;
		expect(targetFlag, "no flag fills the body `name` field").toBeDefined();

		let body: unknown;
		server.use(
			http.post(FORK_URL, async ({ request }) => {
				body = await request.json();
				return HttpResponse.json({
					success: true,
					errors: [],
					messages: [],
					result: { name: "ingress-probe-fork" },
				});
			})
		);
		vi.spyOn(console, "log").mockImplementation(() => {});

		const { exitCode } = await runCf(
			[
				"artifacts",
				"namespaces",
				"repos",
				"fork",
				"ingress-probe",
				"--namespace",
				"spike",
				`--${targetFlag ?? "missing"}`,
				"ingress-probe-fork",
				"--default-branch-only",
				"--quiet",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(body).toEqual({
			name: "ingress-probe-fork",
			default_branch_only: true,
		});
	});
});
