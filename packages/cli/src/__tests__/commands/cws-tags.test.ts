import { writeFileSync } from "node:fs";
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
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const updates = [
	{
		resource: "policies",
		flags: [
			"--name",
			"example",
			"--entrypoint",
			"allow",
			"--rego-source",
			"package policy.example\nallow := true",
		],
	},
	{ resource: "policy-sets", flags: ["--name", "example", "--policies", "[]"] },
	{ resource: "workloads", flags: ["--name", "example", "--filter", "true"] },
	{
		resource: "deployments",
		flags: [
			"--name",
			"example",
			"--default-mode",
			"ALLOW",
			"--basic-auth-credential-ids",
			"credential-id",
			"--policy-set-ids",
			"policy-set-id",
			"--on-error-action",
			"SKIP",
			"--no-rego-raise-error",
		],
	},
];

describe("CWS replacement tag sets", () => {
	runInTempDir();
	setupMsw();
	const env = {
		CI: "true",
		CF_SEND_TELEMETRY: "false",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};
	let output: ReturnType<typeof captureOutput>;
	beforeEach(() => {
		output = captureOutput();
	});
	afterEach(() => vi.restoreAllMocks());

	for (const { resource, flags } of updates) {
		describe(resource, () => {
			const command = ["zero-trust", "cws", resource, "update", "resource-id"];
			const url = `${TEST_BASE_URL}/accounts/test-account/cws/${resource}/resource-id`;

			it.each([
				["inline", '{"env":"prod"}', { env: "prod" }],
				["file", "@tags with spaces.json", { env: "prod" }],
				["empty", "{}", {}],
			] as const)(
				"previews and sends the same %s map",
				async (_label, input, tags) => {
					writeFileSync("tags with spaces.json", '{"env":"prod"}');
					const args = [...command, ...flags, "--tags", input];
					await runCf([...args, "--dry-run"], env);
					const preview = JSON.parse(output.stdout()) as {
						body: Record<string, unknown>;
					};
					expect(preview.body.tags).toEqual(tags);
					let sent: unknown;
					server.use(
						http.put(url, async ({ request }) => {
							sent = await request.json();
							return HttpResponse.json({ success: true, result: null });
						})
					);
					await runCf(args, env);
					expect(sent).toEqual(preview.body);
					if (resource === "deployments") {
						expect(sent).toMatchObject({
							on_error_action: "SKIP",
							rego_raise_error: false,
						});
					}
				}
			);

			it.each([false, true])(
				"rejects omitted tags before sending a request (dry-run=%s)",
				async (dryRun) => {
					const requested = vi.fn(() =>
						HttpResponse.json({ success: true, result: null })
					);
					server.use(http.put(url, requested));
					await expect(
						runCf([...command, ...flags, ...(dryRun ? ["--dry-run"] : [])], env)
					).rejects.toThrow("--tags is required");
					expect(requested).not.toHaveBeenCalled();
				}
			);

			it.each([false, true])(
				"also requires an explicit map in --body (dry-run=%s)",
				async (dryRun) => {
					const requested = vi.fn(() =>
						HttpResponse.json({ success: true, result: null })
					);
					server.use(http.put(url, requested));
					await expect(
						runCf(
							[
								...command,
								"--body",
								'{"name":"example"}',
								...(dryRun ? ["--dry-run"] : []),
							],
							env
						)
					).rejects.toThrow("--body must include a JSON object at tags");
					expect(requested).not.toHaveBeenCalled();
				}
			);

			it("preserves explicit tags from --body @file", async () => {
				const body = { name: "example", tags: {} };
				writeFileSync("update.json", JSON.stringify(body));
				let sent: unknown;
				server.use(
					http.put(url, async ({ request }) => {
						sent = await request.json();
						return HttpResponse.json({ success: true, result: null });
					})
				);
				await runCf([...command, "--body", "@update.json"], env);
				expect(sent).toEqual(body);
			});
		});
	}
});
