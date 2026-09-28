import fs from "node:fs";
import { http, HttpResponse } from "msw";
import { describe, it, vi } from "vitest";
import { mockConsoleMethods } from "../helpers/mock-console";
import { useMockIsTTY } from "../helpers/mock-istty";
import { msw } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

const DB = "38a2e1b9-3a45-4f6e-9d0c-8b7a6c5d4e3f";
const REMOTE_ENV = {
	CLOUDFLARE_API_TOKEN: "test-token",
	CLOUDFLARE_ACCOUNT_ID: "test-account",
};
const LOCAL = "--local --persist-to state";

function writeMigration(name = "0001_test.sql", sql = "SELECT 1;"): void {
	fs.mkdirSync("migrations", { recursive: true });
	fs.writeFileSync(`migrations/${name}`, sql);
}

function mockRemoteQueries(
	applied: string[] = [],
	onAccountId?: (accountId: string) => void
): string[] {
	const queries: string[] = [];
	msw.use(
		http.post(
			"*/accounts/:accountId/d1/database/:databaseId/query",
			async ({ request, params }) => {
				onAccountId?.(String(params.accountId));
				const body = (await request.json()) as { sql: string };
				queries.push(body.sql);
				return HttpResponse.json({
					success: true,
					result: [
						{
							success: true,
							results: body.sql.includes("SELECT")
								? applied.map((name, id) => ({ id: id + 1, name }))
								: [],
						},
					],
				});
			}
		)
	);
	return queries;
}

describe("migrate", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	const { setIsTTY } = useMockIsTTY();

	describe("create", () => {
		it("should reject the --local flag for create", async ({ expect }) => {
			await expect(
				runWrangler("d1 migrations create test --local")
			).rejects.toThrow(/--local is not supported.*do not need --local/s);
			expect(fs.existsSync("migrations")).toBe(false);
		});
		// cf migration discovery is flag-based and does not require project config.
		it.skip("should error when no config file is present", async () => {});

		it("should work without a database_id", async ({ expect }) => {
			await runWrangler("d1 migrations create test-migration");
			expect(fs.existsSync("migrations/0001_test-migration.sql")).toBe(true);
		});

		it("`create` succeeds when the new file matches a permissive pattern", async ({
			expect,
		}) => {
			await runWrangler(
				"d1 migrations create test --dir migrations --pattern 'migrations/**/*.sql'"
			);
			expect(fs.readdirSync("migrations")).toEqual(["0001_test.sql"]);
		});

		it("rejects `wrangler d1 migrations create` with an actionable error when the new file would not match the configured pattern", async ({
			expect,
		}) => {
			await expect(
				runWrangler(
					"d1 migrations create test --dir migrations --pattern 'migrations/*/migration.sql'"
				)
			).rejects.toThrow(/would not match it.*ORM/s);
		});

		it("does not create migrations_dir when `wrangler d1 migrations create` fails the pattern check", async ({
			expect,
		}) => {
			await expect(
				runWrangler(
					"d1 migrations create test --dir migrations --pattern 'migrations/*/migration.sql'"
				)
			).rejects.toThrow(/would not match/);
			expect(fs.existsSync("migrations")).toBe(false);
		});

		it('`create` succeeds with `migrations_dir: "."` (project root as the migrations dir)', async ({
			expect,
		}) => {
			await runWrangler("d1 migrations create test --dir .");
			expect(fs.existsSync("0001_test.sql")).toBe(true);
		});

		it("rejects a migration name containing a path separator with a clear error", async ({
			expect,
		}) => {
			await expect(runWrangler("d1 migrations create foo/bar")).rejects.toThrow(
				/path separator/
			);
		});

		it("rejects a migration name containing a backslash with a clear error", async ({
			expect,
		}) => {
			await expect(
				runWrangler("d1 migrations create 'foo\\bar'")
			).rejects.toThrow(/path separator/);
		});
	});

	describe("apply", () => {
		it("should not attempt to login in local mode", async ({ expect }) => {
			writeMigration();
			delete process.env.CLOUDFLARE_API_TOKEN;
			delete process.env.CLOUDFLARE_ACCOUNT_ID;
			await runWrangler(`d1 migrations apply ${DB} ${LOCAL}`);
			expect(std.out).toContain("0001_test.sql");
		}, 60_000);

		// cf takes migration settings from flags and never reads Wrangler D1 config.
		it.skip("should try to read D1 config from wrangler.toml", async () => {});

		it("should not try to read wrangler.toml in local mode", async ({
			expect,
		}) => {
			fs.writeFileSync("wrangler.toml", "this is deliberately invalid");
			writeMigration();
			await runWrangler(`d1 migrations apply ${DB} ${LOCAL}`);
			expect(std.out).toContain("0001_test.sql");
		}, 60_000);

		// cf migration discovery is flag-based and does not require project config.
		it.skip("should error when no config file is present", async () => {});
		it("should reject the use of --preview with --local", async ({
			expect,
		}) => {
			writeMigration();
			await expect(
				runWrangler(`d1 migrations apply ${DB} --preview ${LOCAL}`)
			).rejects.toThrow(/Unknown argument: preview/);
		});

		it("multiple accounts: should throw when trying to apply migrations without an account_id in config", async ({
			expect,
		}) => {
			setIsTTY(false);
			writeMigration();
			delete process.env.CLOUDFLARE_ACCOUNT_ID;
			const oauth = await import("cf/oauth");
			const getAccount = vi
				.spyOn(oauth, "getOrSelectAccountId")
				.mockImplementation(async (accountId) => {
					expect(accountId).toBeUndefined();
					throw new Error(
						"More than one account available but unable to select one in non-interactive mode."
					);
				});

			try {
				await expect(
					runWrangler(`d1 migrations apply ${DB}`, {
						CLOUDFLARE_API_TOKEN: "test-token",
						CLOUDFLARE_ACCOUNT_ID: undefined,
					})
				).rejects.toThrow(/More than one account.*unable to select one/i);
			} finally {
				getAccount.mockRestore();
			}
		});

		it("multiple accounts: should let the user apply migrations with an account_id in config", async ({
			expect,
		}) => {
			writeMigration();
			fs.writeFileSync(
				"cloudflare.config.ts",
				'export default { accountId: "account-2" };'
			);
			const accountIds: string[] = [];
			mockRemoteQueries([], (accountId) => accountIds.push(accountId));

			await runWrangler(`d1 migrations apply ${DB}`, {
				CLOUDFLARE_API_TOKEN: "test-token",
				CLOUDFLARE_ACCOUNT_ID: undefined,
			});

			expect(new Set(accountIds)).toEqual(new Set(["account-2"]));
		});
		// cf's SDK/local transports cannot return Wrangler's prompt-cancel sentinel.
		it.skip("should throw a clear error when executeSql returns null (execution cancelled)", async () => {});

		it("`apply` records each migration's name in `d1_migrations` as a path relative to `migrations_dir`", async ({
			expect,
		}) => {
			fs.mkdirSync("migrations/0002_users", { recursive: true });
			fs.mkdirSync("migrations/0003_features/auth", { recursive: true });
			fs.writeFileSync("migrations/0001_top.sql", "-- top");
			fs.writeFileSync("migrations/0002_users/0001_init.sql", "-- mid");
			fs.writeFileSync(
				"migrations/0003_features/auth/0001_oauth.sql",
				"-- deep"
			);
			const queries = mockRemoteQueries();

			await runWrangler(
				`d1 migrations apply ${DB} --dir migrations --pattern 'migrations/**/*.sql'`,
				REMOTE_ENV
			);

			const names = queries
				.filter((query) => query.includes("INSERT INTO"))
				.map((query) => /values \('(.+)'\);/.exec(query)?.[1]);
			expect(names).toEqual([
				"0001_top.sql",
				"0002_users/0001_init.sql",
				"0003_features/auth/0001_oauth.sql",
			]);
		});

		describe("with a temporary preview account", () => {
			// cf does not expose Wrangler's preview-database selection flow.
			it.todo("should apply migrations against the account it minted");
		});
	});

	describe("list", () => {
		it("should not attempt to login in local mode", async ({ expect }) => {
			writeMigration();
			delete process.env.CLOUDFLARE_API_TOKEN;
			delete process.env.CLOUDFLARE_ACCOUNT_ID;
			await runWrangler(`d1 migrations list ${DB} ${LOCAL}`);
			expect(std.out).toContain("0001_test.sql");
		}, 60_000);

		// cf migration discovery is flag-based and does not require project config.
		it.skip("should error when no config file is present", async () => {});

		it("should use the custom migrations folder when provided", async ({
			expect,
		}) => {
			fs.mkdirSync("my-migrations-go-here");
			fs.writeFileSync("my-migrations-go-here/0001_custom.sql", "SELECT 1;");
			await runWrangler(
				`d1 migrations list ${DB} --dir my-migrations-go-here ${LOCAL}`
			);
			expect(std.out).toContain("0001_custom.sql");
		}, 60_000);

		it("hints at `migrations_dir` when the folder is missing and the user has not set one", async ({
			expect,
		}) => {
			await expect(
				runWrangler(`d1 migrations list ${DB} ${LOCAL}`)
			).rejects.toThrow(/No migrations directory.*Pass --dir/);
		});

		it("does not hint at `migrations_dir` when the user set it, even to the default `./migrations`", async ({
			expect,
		}) => {
			const error = await runWrangler(
				`d1 migrations list ${DB} --dir ./migrations ${LOCAL}`
			).catch((cause: unknown) => cause);
			expect(error).toBeInstanceOf(Error);
			expect((error as Error).message).toContain("No migrations directory");
			expect((error as Error).message).not.toContain("Pass --dir");
		});
		// cf takes migration settings from flags and never reads Wrangler D1 config.
		it.skip("should try to read D1 config from wrangler.toml when logged in", async () => {});

		it("should throw if user is not authenticated and not using --local", async ({
			expect,
		}) => {
			setIsTTY(false);
			writeMigration();
			delete process.env.CLOUDFLARE_API_TOKEN;
			await expect(
				runWrangler(`d1 migrations list ${DB}`, {
					CLOUDFLARE_ACCOUNT_ID: "test-account",
				})
			).rejects.toThrow(/API token|logged in|auth login/i);
		});

		it("should not try to read wrangler.toml in local mode", async ({
			expect,
		}) => {
			fs.writeFileSync("wrangler.toml", "this is deliberately invalid");
			writeMigration();
			await runWrangler(`d1 migrations list ${DB} ${LOCAL}`);
			expect(std.out).toContain("0001_test.sql");
		}, 60_000);

		it("`list` only shows migrations matching migrations_pattern (nested layout)", async ({
			expect,
		}) => {
			writeMigration("should_be_ignored.sql");
			fs.mkdirSync("migrations/0000_init");
			fs.writeFileSync("migrations/0000_init/migration.sql", "SELECT 1;");
			await runWrangler(
				`d1 migrations list ${DB} --dir migrations --pattern 'migrations/*/migration.sql' ${LOCAL}`
			);
			expect(std.out).toContain("0000_init/migration.sql");
			expect(std.out).not.toContain("should_be_ignored.sql");
		}, 60_000);

		it("`list` prints a drizzle hint when migrations_pattern is the default but a nested layout exists", async ({
			expect,
		}) => {
			const stderr = vi
				.spyOn(process.stderr, "write")
				.mockImplementation(() => true);
			fs.mkdirSync("migrations/0000_init", { recursive: true });
			fs.writeFileSync("migrations/0000_init/migration.sql", "SELECT 1;");
			await runWrangler(`d1 migrations list ${DB} ${LOCAL}`);
			expect(stderr).toHaveBeenCalledWith(
				expect.stringContaining("migrations/*/migration.sql")
			);
		}, 60_000);

		it('`list` with `migrations_dir: "."` treats the project root as the migrations dir', async ({
			expect,
		}) => {
			fs.writeFileSync("0001_top.sql", "SELECT 1;");
			fs.writeFileSync("README.md", "not sql");
			fs.mkdirSync("nested");
			fs.writeFileSync("nested/0002_deep.sql", "SELECT 2;");
			await runWrangler(`d1 migrations list ${DB} --dir . ${LOCAL}`);
			expect(std.out).toContain("0001_top.sql");
			expect(std.out).not.toContain("README.md");
			expect(std.out).not.toContain("0002_deep.sql");
		}, 60_000);

		it("rejects a `migrations_pattern` that does not start with `migrations_dir`", async ({
			expect,
		}) => {
			await expect(
				runWrangler(
					`d1 migrations list ${DB} --dir migrations --pattern 'schema/*.sql' ${LOCAL}`
				)
			).rejects.toThrow(/must start with "migrations\//);
		});

		it("rejects a `migrations_pattern` set without `migrations_dir` with an actionable error", async ({
			expect,
		}) => {
			await expect(
				runWrangler(
					`d1 migrations list ${DB} --pattern 'schema/*.sql' ${LOCAL}`
				)
			).rejects.toThrow(
				/have not set --dir.*--pattern must start with "<dir>\/"/s
			);
		});

		it("should escape single quotes in migration filenames during apply", async ({
			expect,
		}) => {
			writeMigration("0001_add_user's_settings.sql");
			const queries = mockRemoteQueries();
			await runWrangler(`d1 migrations apply ${DB}`, REMOTE_ENV);
			expect(queries.find((query) => query.includes("INSERT INTO"))).toContain(
				"'0001_add_user''s_settings.sql'"
			);
		});

		it("should escape migrationsTableName using double quotes in SQL queries", async ({
			expect,
		}) => {
			writeMigration();
			const queries = mockRemoteQueries();
			await runWrangler(
				`d1 migrations apply ${DB} --table 'my-custom-table'`,
				REMOTE_ENV
			);
			expect(queries[0]).toContain(
				'CREATE TABLE IF NOT EXISTS "my-custom-table"'
			);
			expect(queries[1]).toContain('FROM "my-custom-table"');
			expect(queries.find((query) => query.includes("INSERT INTO"))).toContain(
				'INSERT INTO "my-custom-table"'
			);
		});
	});
});
