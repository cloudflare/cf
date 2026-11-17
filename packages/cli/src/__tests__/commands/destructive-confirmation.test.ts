import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

describe("non-interactive destructive confirmation", () => {
	runInTempDir();
	afterEach(() => vi.restoreAllMocks());

	it.each([
		["delete"],
		["secrets", "delete", "API_KEY"],
		["versions", "delete", "version-id"],
		["deployments", "delete", "deployment-id"],
	])(
		"names the configured Worker in a quiet delete confirmation: %j",
		async (...args) => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default ({ mode }) => ({ worker: { name: "configured-worker-" + mode, compatibilityDate: "2025-01-01" } });`
			);
			const fetch = vi
				.spyOn(globalThis, "fetch")
				.mockRejectedValue(new Error("Unexpected API request"));
			const stderr = vi
				.spyOn(process.stderr, "write")
				.mockImplementation(() => true);
			const stdout = vi.spyOn(console, "log").mockImplementation(() => {});

			const result = await runCf(
				["workers", ...args, "--quiet", "--mode", "staging"],
				{
					CLOUDFLARE_API_TOKEN: "test-token",
					CLOUDFLARE_ACCOUNT_ID: "test-account",
					DO_NOT_TRACK: "1",
				}
			);

			expect(result.exitCode).toBe(1);
			expect(fetch).not.toHaveBeenCalled();
			expect(stdout).not.toHaveBeenCalled();
			const output = stderr.mock.calls.map(([chunk]) => String(chunk)).join("");
			expect(output).toContain("Worker: configured-worker-staging. Continue?");
			expect(output).toContain("pass --force to confirm");
			expect(output).not.toContain("Using Worker:");
		}
	);

	it.each([
		["workflows", "delete", "fixture"],
		["workflows", "delete", "fixture", "--quiet"],
		["queues", "purge", "start", "fixture", "--delete-messages-permanently"],
	])("fails without making a request: %j", async (...args) => {
		const fetch = vi
			.spyOn(globalThis, "fetch")
			.mockRejectedValue(new Error("Unexpected API request"));
		const stderr = vi
			.spyOn(process.stderr, "write")
			.mockImplementation(() => true);
		const stdout = vi.spyOn(console, "log").mockImplementation(() => {});

		const result = await runCf(args, {
			CLOUDFLARE_API_TOKEN: "test-token",
			CLOUDFLARE_ACCOUNT_ID: "test-account",
			DO_NOT_TRACK: "1",
		});

		expect(result.exitCode).toBe(1);
		expect(fetch).not.toHaveBeenCalled();
		expect(stdout).not.toHaveBeenCalled();
		expect(stderr.mock.calls.map(([chunk]) => String(chunk)).join("")).toMatch(
			/pass --force to confirm[\s\S]*Aborted\./
		);
	});
});
