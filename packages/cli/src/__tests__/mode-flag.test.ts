import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadProjectSettings } from "../lib/project-settings.js";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";

describe("--mode global flag", () => {
	runInTempDir();

	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	afterEach(() => vi.restoreAllMocks());

	it("appears in root help", async () => {
		await runCf(["--help"]);

		expect(output.stdout()).toContain("-m, --mode");
	});

	it("rejects duplicate values", async () => {
		await expect(
			runCf(
				[
					"d1",
					"list",
					"--mode",
					"production",
					"--mode",
					"staging",
					"--dry-run",
				],
				{ CLOUDFLARE_ACCOUNT_ID: "account-id", CI: "true" }
			)
		).rejects.toThrow("--mode can only be specified once.");
	});

	it("rejects empty values", async () => {
		for (const modeArgs of [["--mode", ""], ["--mode="]]) {
			await expect(
				runCf(["d1", "list", ...modeArgs, "--dry-run"], {
					CLOUDFLARE_ACCOUNT_ID: "account-id",
					CI: "true",
				})
			).rejects.toThrow("--mode requires a non-empty value.");
		}
	});

	it("selects the mode used to evaluate project settings", async () => {
		writeFileSync(
			join(process.cwd(), "cloudflare.config.ts"),
			`export default ({ mode }) => ({
	accountId: mode === "staging" ? "staging-account" : "default-account",
});`
		);

		await runCf(["--mode", "staging", "d1", "list", "--dry-run"], {
			CI: "true",
		});

		expect(output.stdout()).toContain("/accounts/staging-account/d1/database");
	});

	it("does not reuse the mode from an earlier invocation", async () => {
		writeFileSync(
			join(process.cwd(), "cloudflare.config.ts"),
			`export default ({ mode }) => ({
	accountId: mode ?? "default-account",
});`
		);

		await runCf(["d1", "list", "--mode", "staging", "--dry-run"], {
			CI: "true",
		});
		expect(output.stdout()).toContain("/accounts/staging/d1/database");

		output.clear();
		await runCf(["d1", "list", "--dry-run"], { CI: "true" });
		expect(output.stdout()).toContain("/accounts/default-account/d1/database");
	});

	it("clears the mode before an invocation that fails during parsing", async () => {
		writeFileSync(
			join(process.cwd(), "cloudflare.config.ts"),
			`export default ({ mode }) => ({
	accountId: mode ?? "default-account",
});`
		);

		await runCf(["d1", "list", "--mode", "staging", "--dry-run"], {
			CI: "true",
		});

		await expect(
			runCf(
				[
					"d1",
					"list",
					"--mode",
					"production",
					"--mode",
					"staging",
					"--dry-run",
				],
				{ CLOUDFLARE_ACCOUNT_ID: "account-id", CI: "true" }
			)
		).rejects.toThrow("--mode can only be specified once.");

		await expect(loadProjectSettings()).resolves.toEqual(
			expect.objectContaining({
				settings: expect.objectContaining({ accountId: "default-account" }),
			})
		);
	});
});
