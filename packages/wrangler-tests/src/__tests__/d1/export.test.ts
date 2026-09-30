import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

describe("export", () => {
	mockAccountId();
	mockApiToken();
	const std = mockConsoleMethods();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();
	// TODO_TEST(most of this file should be .todo(), waiting on proper d1 polling support in forge/cf)

	// All assertions in this file rely on wrangler-only behaviour:
	//
	//   - `--output <file>` writes the SQL response body to disk. cf has
	//     no `--output` flag — the export handler just prints the API
	//     response (containing a signed_url) to stdout. The
	//     "missing --output" / "directory --output" / per-file-content
	//     assertions therefore have no cf equivalent.
	//
	//   - `--local` runs against a local SQLite DB and `--remote` is the
	//     opt-in for the API path. cf now has local routing, but Miniflare's
	//     explorer has no D1 export route yet.
	//
	//   - The remote flow polls the export endpoint repeatedly (first
	//     POST kicks off, subsequent POSTs with `current_bookmark` poll
	//     until `status: "complete"`, then the SQL is downloaded from
	//     the returned signed_url). cf does a single POST and prints the
	//     response — no polling, no signed-URL fetch.
	//
	//   - The interactive `⚠️ This process may take some time...`
	//     confirmation prompt is wrangler-side; cf has no such
	//     destructive-confirm wrapper on `d1 export`.
	//
	//   - `--skip-confirmation` is wrangler's spelling of
	//     `--force` (cf's), but it's moot here since cf has no
	//     confirmation to skip.
	//
	//   - The "without database_id" error comes from
	//     wrangler resolving a name → id via the configured
	//     `d1_databases` block; cf doesn't read worker config (see
	//     AGENTS.md "cf does NOT read project worker config"), so this
	//     branch is unreachable.
	//
	//   - `--no-data` / `--no-schema` / `--table foo` map onto cf's
	//     `--dump-options-no-data` / `--dump-options-no-schema` /
	//     `--dump-options-tables`, but the test bodies that exercise
	//     them all assert on the SQL file contents written via
	//     `--output`, so they go away with the `--output` removal.
	it.skip("should throw if output is missing", async () => {});
	it.skip("should throw if output is a directory", async () => {});
	it.skip("should throw if local and remote are both set", async () => {});
	it.todo("should handle local");
	it.skip("should handle remote", async () => {});
	it.skip("should prompt for confirmation when exporting remotely in interactive mode", async () => {});
	it.skip("should not export when confirmation is rejected", async () => {});
	it.skip("should skip confirmation when --skip-confirmation flag is used", async () => {});
	it.skip("should handle remote presigned URL errors", async () => {});
	it.skip("should export locally without database_id", async () => {});
	it.skip("should fail when database_id absent from config and not found in API", async () => {});
	it.skip("should handle multiple tables", async () => {});

	// cf-native coverage: a single POST against the export endpoint
	// returning the polling-task envelope. Verifies argument shape
	// (positional databaseId, --output-format=polling, body assembled
	// from --dump-options-* flags) and that the response is printed
	// verbatim.
	// Forge now explicitly ignores the D1 import/export operations, so cf no
	// longer exposes this API-only approximation of Wrangler's polling flow.
	it.skip("should POST to the export endpoint and print the polling response", async ({
		expect,
	}) => {
		setIsTTY(false);
		const requests = { count: 0 };
		msw.use(
			http.post(
				"*/accounts/:accountId/d1/database/:databaseId/export",
				async ({ request, params }) => {
					requests.count++;
					expect(params.accountId).toEqual("some-account-id");
					expect(params.databaseId).toEqual("xxxx");
					const body = (await request.json()) as Record<string, unknown>;
					// Optional boolean flags (--dump-options-no-data /
					// --dump-options-no-schema) that the caller did not pass
					// are correctly omitted from the wire body (see
					// test_bugs/generator-fabricates-default-false-on-optional-booleans.md).
					expect(body).toEqual({
						output_format: "polling",
						dump_options: {
							tables: ["foo"],
						},
					});
					return HttpResponse.json(
						{
							success: true,
							errors: [],
							messages: [],
							result: {
								success: true,
								type: "export",
								at_bookmark: "yyyy",
								status: "active",
								messages: ["Generating xxxx-yyyy.sql"],
							},
						},
						{ status: 202 }
					);
				}
			)
		);

		await runWrangler(
			"d1 export xxxx --output-format polling --dump-options-tables foo"
		);
		expect(requests.count).toEqual(1);
		const parsed = JSON.parse(std.out);
		expect(parsed).toMatchObject({
			type: "export",
			at_bookmark: "yyyy",
			status: "active",
		});
	});
});
