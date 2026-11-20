import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { runCf } from "../helpers/run-cf.js";

/**
 * cloudflare/cf#717: `--dry-run` ignores `--local`. It prints the remote
 * api.cloudflare.com URL for commands that run locally, and succeeds for
 * commands that have no local equivalent.
 */
describe("--local --dry-run", () => {
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

	it("shows local targeting instead of the remote API URL", async () => {
		const { exitCode } = await runCf(
			["workflows", "list", "--local", "--dry-run"],
			ENV
		);

		expect(exitCode).toBe(0);
		expect(output()).not.toContain("api.cloudflare.com");
		expect(output()).toContain('"local": true');
	});

	it("rejects a command with no local equivalent, as without --dry-run", async () => {
		await expect(
			runCf(
				[
					"d1",
					"query",
					"00000000-0000-0000-0000-000000000000",
					"--sql",
					"SELECT 1",
					"--local",
					"--dry-run",
				],
				ENV
			)
		).rejects.toThrow(/no local equivalent/i);
	});
});
