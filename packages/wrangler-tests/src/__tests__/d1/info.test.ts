import { http, HttpResponse } from "msw";
import { beforeEach, describe, it } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

// cf requires an explicit account ID in non-interactive mode (it does
// not auto-discover via the memberships API the way wrangler did), so
// provide one. The msw handler matches any `:accountId`, so the value
// is incidental to what this test asserts (the JSON output shape).
describe("info", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	beforeEach(() => {
		setIsTTY(false);
	});

	it("should display version as valid json when alpha", async ({ expect }) => {
		msw.use(
			http.get("*/accounts/:accountId/d1/database/*", async () => {
				return HttpResponse.json(
					{
						result: {
							uuid: "d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06",
							name: "northwind",
							created_at: "2023-05-23T08:33:54.590Z",
							version: "alpha",
							num_tables: 13,
							file_size: 33067008,
							running_in_region: "WEUR",
						},
						success: true,
						errors: [],
						messages: [],
					},
					{ status: 200 }
				);
			})
		);
		// cf takes the database id directly as the positional. wrangler's
		// `d1 info <name>` resolved a name → id via list; cf doesn't.
		await runWrangler("d1 get d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06");
		expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
			{
			  "created_at": "2023-05-23T08:33:54.590Z",
			  "file_size": 33067008,
			  "name": "northwind",
			  "num_tables": 13,
			  "running_in_region": "WEUR",
			  "uuid": "d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06",
			  "version": "alpha",
			}
		`);
	});

	it("should display database info as valid json including version when not alpha", async ({
		expect,
	}) => {
		msw.use(
			http.get("*/accounts/:accountId/d1/database/*", async () => {
				return HttpResponse.json(
					{
						result: {
							uuid: "d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06",
							name: "northwind",
							created_at: "2023-05-23T08:33:54.590Z",
							version: "production",
							num_tables: 13,
							file_size: 33067008,
							running_in_region: "WEUR",
							read_replication: {
								mode: "disabled",
							},
						},
						success: true,
						errors: [],
						messages: [],
					},
					{ status: 200 }
				);
			})
		);
		// cf's `d1 get` doesn't fold in GraphQL analytics — the
		// `read_queries_24h` / `rows_read_24h` / etc. fields wrangler
		// merged in via a /graphql POST aren't present in cf's output.
		// Test asserts the raw API response shape only.
		await runWrangler("d1 get d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06");
		expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
			{
			  "created_at": "2023-05-23T08:33:54.590Z",
			  "file_size": 33067008,
			  "name": "northwind",
			  "num_tables": 13,
			  "read_replication": {
			    "mode": "disabled",
			  },
			  "running_in_region": "WEUR",
			  "uuid": "d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06",
			  "version": "production",
			}
		`);
	});

	// cf always emits JSON; the wrangler-style boxed-table pretty-print
	// (with the wrangler banner, MB-formatted size, dotted
	// `read_replication.mode` key) has no cf equivalent.
	it.skip("should pretty print by default, incl. the wrangler banner", async () => {});
});
