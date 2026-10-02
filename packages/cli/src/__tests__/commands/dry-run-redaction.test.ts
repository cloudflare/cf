import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { runCf } from "../helpers/run-cf.js";

describe("generated dry-run redaction", () => {
	runInTempDir();

	const ENV = { CLOUDFLARE_ACCOUNT_ID: "test-account", NO_COLOR: "1" };
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
		expect(output()).toContain('"text": "<redacted>"');
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
		expect(output()).toContain('"text": "<redacted>"');
		expect(output()).not.toContain("hunter2-secret");
	});

	it.each([
		{
			input: "flags",
			args: [
				"--origin-password",
				"hyperdrive-secret",
				"--origin-user",
				"database-user",
			],
		},
		{
			input: "--body",
			args: [
				"--body",
				JSON.stringify({
					origin: {
						password: "hyperdrive-secret",
						access_client_secret: "access-secret",
						user: "database-user",
					},
				}),
			],
		},
	])(
		"redacts nested Hyperdrive origin secrets from $input",
		async ({ args }) => {
			const { exitCode } = await runCf(
				["hyperdrive", "replace", "config-id", ...args, "--dry-run"],
				ENV
			);

			expect(exitCode).toBe(0);
			const preview = JSON.parse(output()) as {
				body: { origin: Record<string, unknown> };
			};
			expect(preview.body.origin).toMatchObject({
				password: "<redacted>",
				user: "database-user",
			});
			expect(output()).not.toContain("hyperdrive-secret");
			if (args[0] === "--body") {
				expect(preview.body.origin.access_client_secret).toBe("<redacted>");
				expect(output()).not.toContain("access-secret");
			}
		}
	);
});
