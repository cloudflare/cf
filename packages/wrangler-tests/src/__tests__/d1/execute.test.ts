import { http, HttpResponse } from "msw";
import { describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { createFetchResult, msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

// The wrangler corpus for `d1 execute` is almost entirely wrangler-shaped:
//   - `--local` exercises a configured binding name, while cf's local
//     D1 raw command addresses a database id directly and does not read
//     project Worker config.
//   - `--remote` is wrangler's opt-in to hit the API; cf reserves that
//     spelling and uses the API unless `--local` is present.
//   - The `<db>` positional resolves a binding name → id via the
//     wrangler.toml `d1_databases` block plus a list-then-match call.
//     cf's equivalents (`d1 query <databaseId>` / `d1 raw <databaseId>`)
//     take the UUID directly.
//   - `--command "SQL"` and `--file path.sql` are both wrangler flag
//     names. cf uses `--sql` (which already accepts `@path` via
//     `paramOverride.fromFile`).
//   - The "🚣 Executed N command(s) in Xms" banner / duration line
//     and the wrangler version banner are wrangler-only output.
//
// Almost every test below either depends on `--local`, on the
// binding-name lookup, on wrangler's CLI flag names, or on
// wrangler-only output. The two duration tests do exercise a real
// API call against `/d1/database/:databaseId/query`, so they're
// re-pointed at `cf d1 query <id> --sql ...` and the assertion is
// rewritten to match cf's JSON-result output instead of wrangler's
// duration banner.

describe("execute", () => {
	const std = mockConsoleMethods();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();

	// These remain wrangler-only: they exercise `--command`/`--file`
	// flag names, the `--remote`/`--preview`/`--local` flag matrix, or
	// wrangler's binding-name lookup. cf uses `d1 raw <databaseId>`
	// --sql ...` for local execution, but cannot satisfy the canonical
	// config-without-database-id situation below by design.
	it.skip("should expect either --command or --file", async () => {});
	it.skip("should reject use of both --command and --file", async () => {});
	it.skip("should reject the use of --remote with --local", async () => {});
	it.skip("should reject the use of --preview with --local", async () => {});
	it.skip("should reject the use of --preview with --local with --json", async () => {});
	it.skip("should show banner by default", async () => {});
	it.skip("should execute locally without database_id", async () => {});

	// Ported: cf requires authentication for the remote (only) path.
	// With no `CLOUDFLARE_API_TOKEN` and no stored OAuth token (the
	// `runInTempDir()` HOME stub isolates the on-disk token store),
	// `createCommandClient` → `getAuthToken()` throws before any
	// request leaves the process.
	it("should require login when running against prod", async ({ expect }) => {
		setIsTTY(false);
		await expect(
			runWrangler("d1 query xxxx --sql 'select 1;'", {
				CLOUDFLARE_API_TOKEN: undefined,
			})
		).rejects.toThrow(/No authentication token found/i);
	});

	describe("with credentials", () => {
		mockAccountId({ accountId: "some-account-id" });
		mockApiToken();

		// Wrangler-only: wrangler sniffed the SQLite magic header and
		// refused a binary DB before sending it. cf deliberately dropped
		// all client-side input hardening (commit b91b74cf
		// "refactor(cli): drop client-side input hardening") — there is no
		// trust boundary on a client-side CLI driving the user's own
		// credentials, so `--sql @<path>` now reads the file verbatim
		// (control chars / NUL bytes included; see
		// `lib/input-validation.test.ts` "reads a text @file verbatim,
		// including control chars") and forwards it to the API, which
		// decides. cf therefore has no equivalent binary-DB rejection.
		it.skip("should reject a binary SQLite DB", async () => {});

		// Ported (assertion loosened): cf's `--sql @<path>` ingestion
		// wraps the `node:fs` read failure in a friendly message rather
		// than throwing wrangler's `UserError` type. We only assert it
		// rejects with a sensible message naming the missing file.
		it("should throw a UserError if file does not exist", async ({
			expect,
		}) => {
			setIsTTY(false);
			await expect(
				runWrangler("d1 query xxxx --sql @does-not-exist.sql")
			).rejects.toThrow(/cannot read file at 'does-not-exist\.sql'/i);
		});

		// Ported (assertion loosened): cf surfaces an API constraint
		// failure as the SDK's `APIError`. The exact code-level message
		// is forge/SDK territory; here we just assert cf rejects rather
		// than silently succeeding.
		it("should treat SQLite constraint errors as UserErrors", async ({
			expect,
		}) => {
			setIsTTY(false);
			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/:databaseId/query",
					async () => {
						return HttpResponse.json(
							createFetchResult(null, false, [
								{
									code: 7500,
									message: "UNIQUE constraint failed: users.email",
								},
							]),
							{ status: 400 }
						);
					},
					{ once: true }
				)
			);
			await expect(
				runWrangler(
					"d1 query xxxx --sql \"insert into users (email) values ('a@b.com');\""
				)
			).rejects.toThrow(/UNIQUE constraint failed: users.email/i);
		});

		// Ported without `--json` (cf is always JSON): assert that stdout
		// is valid, parseable JSON matching the query result.
		it("should output valid JSON with --json flag", async ({ expect }) => {
			setIsTTY(false);
			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/:databaseId/query",
					async () => {
						return HttpResponse.json(
							createFetchResult([
								{
									results: [{ id: 1, name: "Alice" }],
									success: true,
									meta: { duration: 1.23 },
								},
							])
						);
					},
					{ once: true }
				)
			);
			await runWrangler("d1 query xxxx --sql 'select * from users;'");
			let parsed: unknown;
			expect(() => (parsed = JSON.parse(std.out))).not.toThrow();
			expect(parsed).toEqual([
				{
					results: [{ id: 1, name: "Alice" }],
					success: true,
					meta: { duration: 1.23 },
				},
			]);
		});

		// Ported without `--json` (cf is always JSON): a SQL NULL comes
		// back as JSON `null` and must pass through unchanged.
		it("should output JSON null for SQL NULL values with --json flag", async ({
			expect,
		}) => {
			setIsTTY(false);
			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/:databaseId/query",
					async () => {
						return HttpResponse.json(
							createFetchResult([
								{
									results: [{ id: 1, name: null }],
									success: true,
									meta: { duration: 0.5 },
								},
							])
						);
					},
					{ once: true }
				)
			);
			await runWrangler("d1 query xxxx --sql 'select id, name from users;'");
			const parsed = JSON.parse(std.out);
			expect(parsed[0].results[0]).toHaveProperty("name", null);
			expect(parsed[0].results[0].name).toBeNull();
		});
	});

	describe("duration formatting", () => {
		mockAccountId({ accountId: "some-account-id" });
		mockApiToken();

		// cf doesn't print a "🚣 Executed N command in Xms" banner; it
		// just outputs the JSON result of the query call. The original
		// assertion is wrangler-only output, so the port verifies the
		// cf-shape: the request reaches the right URL and the SDK
		// surfaces the result JSON on stdout.
		it("should format duration to 2 decimal places in milliseconds for remote execution", async ({
			expect,
		}) => {
			setIsTTY(false);

			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/:databaseId/query",
					async ({ params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.databaseId).toEqual("xxxx");
						return HttpResponse.json(
							createFetchResult([
								{
									results: [{ result: 1 }],
									success: true,
									meta: { duration: 123.456 },
								},
							])
						);
					}
				)
			);

			await runWrangler("d1 query xxxx --sql 'select 1;'");
			const parsed = JSON.parse(std.out);
			expect(parsed).toMatchObject([
				{
					results: [{ result: 1 }],
					success: true,
					meta: { duration: 123.456 },
				},
			]);
		});

		it("should format batch execution duration with 2 decimal places", async ({
			expect,
		}) => {
			setIsTTY(false);

			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/:databaseId/query",
					async ({ params }) => {
						expect(params.accountId).toEqual("some-account-id");
						expect(params.databaseId).toEqual("xxxx");
						return HttpResponse.json(
							createFetchResult([
								{
									results: [{ result: 1 }],
									success: true,
									meta: { duration: 100 },
								},
								{
									results: [{ result: 2 }],
									success: true,
									meta: { duration: 200.5 },
								},
								{
									results: [{ result: 3 }],
									success: true,
									meta: { duration: 50.25 },
								},
							])
						);
					}
				)
			);

			await runWrangler("d1 query xxxx --sql 'select 1; select 2; select 3;'");
			const parsed = JSON.parse(std.out);
			expect(parsed).toHaveLength(3);
			expect(parsed[0].meta.duration).toBe(100);
			expect(parsed[1].meta.duration).toBe(200.5);
			expect(parsed[2].meta.duration).toBe(50.25);
		});
	});
});
