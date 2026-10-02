import { writeWranglerConfig } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, it, vi } from "vite-plus/test";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

const DB_UUID = "d5b1d127-xxxx-xxxx-xxxx-cbc69f0a9e06";

describe("time-travel", () => {
	const std = mockConsoleMethods();
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const { setIsTTY } = useMockIsTTY();

	describe("restore", () => {
		// Wrangler validated `--timestamp` and `--bookmark` were
		// mutually exclusive at the CLI layer. cf's generated
		// `d1 time-travel restore` builds a body with whichever the
		// user passed and forwards both to the API; there's no
		// pre-flight rejection. The mutual-exclusion check is
		// wrangler-only.
		// TODO_TEST(shouldn't this be a yargs .conflicts()? is this information in the API?)

		it.skip("should reject the use of --timestamp with --bookmark", async () => {});
	});

	// `throwIfDatabaseIsAlpha` is a wrangler-internal helper that
	// gates the time-travel command on the database's `version` field
	// (via a GET to `/d1/database/:id`). cf's generated
	// `d1 time-travel restore` / `d1 time-travel get-bookmark` go
	// straight to the time-travel endpoints and let the API reject
	// alpha databases. Both the helper and the gate it implements
	// have no cf equivalent, so the entire describe is skipped.
	describe.skip("throwIfDatabaseIsAlpha", () => {
		it.skip("should throw for alpha dbs", async () => {});
		it.skip("should not throw for non-alpha dbs", async () => {});
	});

	describe("--json", () => {
		beforeEach(() => {
			setIsTTY(false);
			writeWranglerConfig({
				d1_databases: [
					{ binding: "DATABASE", database_name: "db", database_id: DB_UUID },
				],
			});
			// cf calls the time-travel endpoints directly — wrangler's
			// extra GET to `/d1/database/:id` (used to gate alpha
			// databases) has no cf equivalent, so it's not mocked here.
			msw.use(
				http.post(
					"*/accounts/:accountId/d1/database/*/time_travel/restore",
					async () => {
						return HttpResponse.json(
							{
								result: {
									bookmark: "a",
								},
								success: true,
								errors: [],
								messages: [],
							},
							{ status: 200 }
						);
					}
				),
				http.get(
					"*/accounts/:accountId/d1/database/*/time_travel/bookmark",
					async () => {
						return HttpResponse.json(
							{
								result: {
									bookmark: "b",
								},
								success: true,
								errors: [],
								messages: [],
							},
							{ status: 200 }
						);
					}
				)
			);
			vi.useFakeTimers();
			vi.setSystemTime(new Date("2011-10-05T14:48:00.000Z"));
		});
		afterEach(() => {
			vi.useRealTimers();
		});
		describe("restore", () => {
			it("should print valid json, without wrangler banner", async ({
				expect,
			}) => {
				await runWrangler(
					`d1 time-travel restore ${DB_UUID} --timestamp=2011-09-05T14:48:00.000Z --force`
				);
				expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
					{
					  "bookmark": "a",
					}
				`);
			});

			it("should pretty print by default", async ({ expect }) => {
				setIsTTY(true);
				await runWrangler(
					`d1 time-travel restore ${DB_UUID} --timestamp=2011-09-05T14:48:00.000Z --force`
				);
				expect(std.out).toMatchInlineSnapshot(`
					"{
					  "bookmark": "a"
					}"
				`);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});
		});
		describe("info", () => {
			it("should print valid json, without wrangler banner", async ({
				expect,
			}) => {
				await runWrangler(
					`d1 time-travel get-bookmark ${DB_UUID} --timestamp=2011-09-05T14:48:00.000Z`
				);
				expect(JSON.parse(std.out)).toMatchInlineSnapshot(`
					{
					  "bookmark": "b",
					}
				`);
			});
			it("should pretty print by default", async ({ expect }) => {
				setIsTTY(true);
				await runWrangler(
					`d1 time-travel get-bookmark ${DB_UUID} --timestamp=2011-09-05T14:48:00.000Z`
				);
				expect(std.out).toMatchInlineSnapshot(`
					"{
					  "bookmark": "b"
					}"
				`);
				expect(std.err).toMatchInlineSnapshot(`""`);
			});
		});
	});
});
