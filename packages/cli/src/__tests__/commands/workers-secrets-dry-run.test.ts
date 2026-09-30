import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCf } from "../helpers/run-cf.js";

describe("workers secrets dry-run", () => {
	runInTempDir();

	const ENV = { CLOUDFLARE_ACCOUNT_ID: "test-account" };
	let log: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		log = vi.spyOn(console, "log").mockImplementation(() => {});
	});
	afterEach(() => log.mockRestore());

	function output(): string {
		return log.mock.calls.map((call: unknown[]) => String(call[0])).join("\n");
	}

	it("redacts --text by default", async () => {
		const { exitCode } = await runCf(
			[
				"workers",
				"secrets",
				"update",
				"API_KEY",
				"--worker",
				"example",
				"--type",
				"secret_text",
				"--text",
				"hunter2-secret",
				"--dry-run",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(output()).toContain('"text": "<redacted, 14 chars>"');
		expect(output()).not.toContain("hunter2-secret");
	});

	it("redacts JSON loaded through --body @file", async () => {
		writeFileSync(
			"secret.json",
			JSON.stringify({
				name: "API_KEY",
				type: "secret_text",
				text: "hunter2-secret",
			})
		);
		const { exitCode } = await runCf(
			[
				"workers",
				"secrets",
				"update",
				"API_KEY",
				"--worker",
				"example",
				"--body",
				"@secret.json",
				"--dry-run",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(output()).toContain('"text": "<redacted, 14 chars>"');
		expect(output()).not.toContain("hunter2-secret");
	});

	it("reveals sensitive values with --show-secrets", async () => {
		const { exitCode } = await runCf(
			[
				"workers",
				"secrets",
				"update",
				"API_KEY",
				"--worker",
				"example",
				"--type",
				"secret_text",
				"--text",
				"hunter2-secret",
				"--dry-run",
				"--show-secrets",
			],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(output()).toContain('"text": "hunter2-secret"');
	});
});
