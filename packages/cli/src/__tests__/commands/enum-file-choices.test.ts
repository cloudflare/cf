import { writeFileSync } from "node:fs";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { captureOutput } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

describe("generated string enum body flags", () => {
	runInTempDir();
	const environment = { CLOUDFLARE_ACCOUNT_ID: "test-account", NO_COLOR: "1" };
	let output: ReturnType<typeof captureOutput>;

	beforeEach(() => {
		output = captureOutput();
	});

	async function preview(operation: "create" | "update", region: string) {
		return runCf(
			[
				"turnstile",
				"widgets",
				operation,
				...(operation === "update" ? ["test-widget"] : []),
				"--name",
				"example",
				"--region",
				region,
				"--dry-run",
			],
			environment
		);
	}

	it.each(["create", "update"] as const)(
		"accepts an allowed enum from @file for %s",
		async (operation) => {
			writeFileSync("region.txt", "china");
			expect(await preview(operation, "@region.txt")).toEqual({ exitCode: 0 });
			expect(output.stdout()).toContain('"region": "china"');
		}
	);

	it("continues to accept a literal enum choice", async () => {
		expect(await preview("create", "world")).toEqual({ exitCode: 0 });
		expect(output.stdout()).toContain('"region": "world"');
	});

	it("rejects invalid file contents as an enum choice", async () => {
		writeFileSync("region.txt", "somewhere-else");
		await expect(preview("create", "@region.txt")).rejects.toThrow(
			/Invalid values.*region/s
		);
	});

	it("reports an unreadable file before checking enum choices", async () => {
		await expect(preview("create", "@missing.txt")).rejects.toThrow(
			/--region: cannot read file at 'missing.txt'/
		);
	});
});
