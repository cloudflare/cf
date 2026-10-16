import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

describe("nested array body flags", () => {
	runInTempDir();
	setupMsw();
	afterEach(() => vi.restoreAllMocks());
	const env = {
		CI: "true",
		CF_SEND_TELEMETRY: "false",
		CLOUDFLARE_API_TOKEN: "test-token",
		CLOUDFLARE_ACCOUNT_ID: "test-account",
		CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	};
	const clauses = [
		{
			actors: [],
			attacker_countries: [],
			target_countries: [],
			target_industries: [],
			categories: [],
			techniques: [],
			cves: [],
			keywords: ["example"],
		},
	];
	const branches = [[{ field: "event", op: "contains", value: "example" }]];
	for (const action of ["create", "update"]) {
		describe(action, () => {
			const command = [
				"cloudforce-one",
				"priority-intelligence",
				action,
				...(action === "update" ? ["priority-id"] : []),
				"--requirement",
				"example",
			];
			const url = `${TEST_BASE_URL}/accounts/test-account/cloudforce-one/v2/priority-intelligence${action === "update" ? "/priority-id" : ""}`;
			const requestHandler = action === "create" ? http.post : http.put;

			it.each(["inline", "file", "body"])(
				"previews and sends complete arrays from %s input",
				async (input) => {
					const output = captureOutput();
					writeFileSync("clauses ü.json", JSON.stringify(clauses));
					writeFileSync("branches ü.json", JSON.stringify(branches));
					const expected = {
						intent: {
							clauses,
							indicators: ["example"],
							unsupported_terms: ["example"],
						},
						query: { branches, version: 1 },
					};
					const args =
						input === "body"
							? [
									...command,
									"--body",
									JSON.stringify({ requirement: "example", ...expected }),
								]
							: [
									...command,
									"--intent-clauses",
									input === "file"
										? "@clauses ü.json"
										: JSON.stringify(clauses),
									"--intent-indicators",
									"example",
									"--intent-unsupported-terms",
									"example",
									"--query-branches",
									input === "file"
										? "@branches ü.json"
										: JSON.stringify(branches),
									"--query-version",
									"1",
								];
					await runCf([...args, "--dry-run"], env);
					const preview = JSON.parse(output.stdout()) as {
						body: Record<string, unknown>;
					};
					expect(preview.body).toMatchObject(expected);
					let sent: unknown;
					server.use(
						requestHandler(url, async ({ request }) => {
							sent = await request.json();
							return HttpResponse.json({ success: true, result: null });
						})
					);
					await runCf(args, env);
					expect(sent).toEqual(preview.body);
				}
			);

			it("omits optional parents when no group flags are supplied", async () => {
				const output = captureOutput();
				await runCf([...command, "--dry-run"], env);
				const { body } = JSON.parse(output.stdout());
				expect(body).not.toHaveProperty("intent");
				expect(body).not.toHaveProperty("query");
			});

			it.each([false, true])(
				"rejects partial groups before sending (dry-run=%s)",
				async (dryRun) => {
					captureOutput();
					const requested = vi.fn(() =>
						HttpResponse.json({ success: true, result: null })
					);
					server.use(requestHandler(url, requested));
					for (const [flags, missing] of [
						[
							[
								"--intent-indicators",
								"example",
								"--intent-unsupported-terms",
								"example",
							],
							"--intent-clauses",
						],
						[
							["--intent-clauses", JSON.stringify(clauses)],
							"--intent-indicators, --intent-unsupported-terms",
						],
						[["--query-version", "1"], "--query-branches"],
					] as const) {
						await expect(
							runCf(
								[...command, ...flags, ...(dryRun ? ["--dry-run"] : [])],
								env
							)
						).rejects.toThrow(missing);
					}
					expect(requested).not.toHaveBeenCalled();
				}
			);
		});
	}
});
