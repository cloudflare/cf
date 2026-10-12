import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

describe("non-interactive destructive confirmation", () => {
	runInTempDir();
	afterEach(() => vi.restoreAllMocks());

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
