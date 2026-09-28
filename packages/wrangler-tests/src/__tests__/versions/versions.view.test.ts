import { beforeEach, describe, test } from "vitest";
import { mockAccountId, mockApiToken } from "../helpers/mock-account-id";
import { mockConsoleMethods } from "../helpers/mock-console";
import { msw, mswGetVersion } from "../helpers/msw";
import { runInTempDir } from "../helpers/run-in-tmp";
import { runWrangler } from "../helpers/run-wrangler";

const VERSION_ID = "10000000-0000-0000-0000-000000000000";

describe("versions view", () => {
	mockAccountId();
	mockApiToken();
	runInTempDir();
	const std = mockConsoleMethods();

	describe("without wrangler.toml", () => {
		beforeEach(() => msw.use(mswGetVersion()));

		test("fails with no args", async ({ expect }) => {
			await expect(runWrangler("workers versions get")).rejects.toThrow(
				/Not enough non-option arguments/
			);
		});

		test("fails with --name arg only", async ({ expect }) => {
			await expect(
				runWrangler("workers versions get --worker-id test-name")
			).rejects.toThrow(/Not enough non-option arguments/);
		});

		test("fails with positional version-id arg only", async ({ expect }) => {
			await expect(
				runWrangler(`workers versions get ${VERSION_ID}`)
			).rejects.toThrow(/Missing required argument: worker-id/);
		});

		test("succeeds with positional version-id arg and --name arg", async ({
			expect,
		}) => {
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(JSON.parse(std.out)).toMatchObject({ id: VERSION_ID });
		});

		test("prints version to stdout as valid json", async ({ expect }) => {
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(() => JSON.parse(std.out)).not.toThrow();
		});
	});

	describe("with wrangler.toml", () => {
		// These cases specifically source the Worker name from wrangler.toml.
		test.skip("fails with no args", async () => {});
		test.skip("succeeds with positional version-id arg only", async () => {});
		test.skip("fails with non-existent version-id", async () => {});
		test.skip("prints version to stdout as valid json", async () => {});
	});

	describe("test output", () => {
		test("no secrets, bindings or compat info is logged if not existing", async ({
			expect,
		}) => {
			msw.use(mswGetVersion(versionWith({ bindings: [], script_runtime: {} })));
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			const output = JSON.parse(std.out) as {
				resources: { bindings: unknown[]; script_runtime: object };
			};
			expect(output.resources.bindings).toEqual([]);
			expect(output.resources.script_runtime).toEqual({});
		});

		test("compat date is logged if provided", async ({ expect }) => {
			msw.use(
				mswGetVersion(
					versionWith({ script_runtime: { compatibility_date: "2000-00-00" } })
				)
			);
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(std.out).toContain("2000-00-00");
		});

		test("compat flag is logged if provided", async ({ expect }) => {
			msw.use(
				mswGetVersion(
					versionWith({ script_runtime: { compatibility_flags: ["flag_1"] } })
				)
			);
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(std.out).toContain("flag_1");
		});

		test("secrets are logged if provided", async ({ expect }) => {
			msw.use(
				mswGetVersion(
					versionWith({
						bindings: [{ type: "secret_text", name: "SECRET" }],
					})
				)
			);
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(std.out).toContain("SECRET");
		});

		test("env vars are logged if provided", async ({ expect }) => {
			msw.use(
				mswGetVersion(
					versionWith({
						bindings: [{ type: "plain_text", name: "PLAIN", text: "value" }],
					})
				)
			);
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(std.out).toContain("PLAIN");
		});

		test("bindings are logged if provided", async ({ expect }) => {
			msw.use(
				mswGetVersion(
					versionWith({
						bindings: [
							{ type: "kv_namespace", name: "KV", namespace_id: "kv-id" },
						],
					})
				)
			);
			await runWrangler(
				`workers versions get ${VERSION_ID} --worker-id test-name`
			);
			expect(std.out).toContain("kv-id");
		});
	});
});

function versionWith(resources: Record<string, unknown>) {
	return {
		id: VERSION_ID,
		number: 2,
		metadata: {
			author_email: "test@test.com",
			author_id: "123",
			created_on: "2020-01-01T00:00:00Z",
			modified_on: "2020-01-01T00:00:00Z",
			source: "api",
		},
		resources: {
			script: { handlers: ["fetch"], last_deployed_from: "api" },
			...resources,
		},
	};
}
