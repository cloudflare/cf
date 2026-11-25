import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCf } from "./helpers/run-cf.js";

/**
 * `--dry-run` previews what the command would do, so it must not
 * describe a request the command will never make: with `--local` the
 * command runs against the local runtime, never against
 * `api.cloudflare.com`, and commands with no local equivalent fail at
 * runtime instead of running remotely (#717).
 */
describe("--local --dry-run preview", () => {
	// Isolate the global config dir (HOME / XDG_CONFIG_HOME) so a
	// developer's stored OAuth token or account selection cannot leak
	// into the preview, and give `--persist-to` a scratch cwd.
	runInTempDir();

	let logSpy: ReturnType<typeof vi.spyOn>;
	let errSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		// formatOutput / formatDryRun write JSON via console.log.
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		// Silence the error box renderer (stderr) so the rejected case
		// doesn't spam the reporter.
		errSpy = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	});

	afterEach(() => {
		logSpy.mockRestore();
		errSpy.mockRestore();
	});

	/** Join captured console.log args into a single string for assertions. */
	function stdout(): string {
		return logSpy.mock.calls.map((c: unknown[]) => String(c[0])).join("\n");
	}

	it("does not preview a remote api.cloudflare.com request for a locally executed command", async () => {
		await runCf(["workflows", "list", "--local", "--dry-run"]);

		expect(stdout()).toContain("cf workflows list");
		expect(stdout()).not.toContain("api.cloudflare.com");
	}, 60_000);

	it("fails like the real command when there is no local equivalent", async () => {
		await expect(
			runCf([
				"d1",
				"query",
				"db-1",
				"--sql",
				"SELECT 1",
				"--local",
				"--persist-to",
				"state",
				"--dry-run",
			])
		).rejects.toThrow(/no local equivalent/i);
	}, 60_000);
});
