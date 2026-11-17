import { Readable } from "node:stream";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

describe("cf workers secrets update --dry-run (#344)", () => {
	runInTempDir();

	const ENV = { CI: "true", CLOUDFLARE_ACCOUNT_ID: "account-id" };
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});
	afterEach(() => vi.restoreAllMocks());

	const args = [
		"workers",
		"secrets",
		"update",
		"API_KEY",
		"--worker",
		"my-worker",
		"--type",
		"secret_text",
		"--dry-run",
	];

	it("reads a piped secret into the preview, redacted", async () => {
		vi.spyOn(process, "stdin", "get").mockReturnValue(
			Readable.from(["piped-secret\n"]) as unknown as typeof process.stdin
		);

		await runCf(args, ENV);

		const out = output.stdout();
		expect(out).toContain('"text"');
		expect(out).not.toContain("piped-secret");
	});

	it("fails when no value is passed and nothing is piped", async () => {
		vi.spyOn(process, "stdin", "get").mockReturnValue(
			Readable.from([]) as unknown as typeof process.stdin
		);

		await expect(runCf(args, ENV)).rejects.toThrow("--text is required");
	});
});
