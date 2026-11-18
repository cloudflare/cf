import { readFile } from "node:fs/promises";
import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../helpers/capture-output.js";
import { runCf } from "../helpers/run-cf.js";

// Unlike migrate.test.ts, this file does not mock `@cloudflare/codemods`:
// it runs the real migration against a malformed Wrangler config, as a user
// would, and checks the diagnostic cf prints.
// https://github.com/cloudflare/cf/issues/697
describe("cf migrate with malformed Wrangler JSONC", () => {
	runInTempDir();

	const std = mockOutputStreams();

	it("reports the config file and the location of the syntax error", async () => {
		const malformed = '{ "name": ';
		await seed({ "wrangler.jsonc": malformed });

		let exitCode: number | undefined;
		try {
			({ exitCode } = await runCf([
				"migrate",
				"--dry-run",
				"--bundler",
				"vite",
			]));
		} catch {
			exitCode = 1;
		}

		expect(exitCode).not.toBe(0);
		expect(await readFile("wrangler.jsonc", "utf8")).toBe(malformed);
		expect(std.err).toContain("ValueExpected");
		// The parser reports this at line 1, column 11 of wrangler.jsonc.
		expect(std.err).toContain("wrangler.jsonc");
		expect(std.err).toContain("1:11");
	});
});
