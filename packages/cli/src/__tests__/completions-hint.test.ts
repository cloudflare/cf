import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { getCfConfigPath } from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mockOutputStreams } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";
import type * as InteractiveModule from "../lib/interactive.js";

const runtime = vi.hoisted(() => ({ isCI: false }));

vi.mock("../lib/interactive.js", async (importOriginal) => ({
	...(await importOriginal<typeof InteractiveModule>()),
	get isCI() {
		return runtime.isCI;
	},
}));

vi.mock("../lib/update-check.js", () => ({
	getUpdateNotice: vi.fn(),
	maybeStartBackgroundUpdateCheck: vi.fn(),
}));

const HINT =
	"●  Tip: run cf complete <bash|zsh|fish|powershell> to install shell completions.";

describe("shell completions hint", () => {
	runInTempDir();
	const std = mockOutputStreams();

	beforeEach(() => {
		runtime.isCI = false;
		std.setStderrTTY(true);
	});

	async function runHelp(): Promise<string> {
		await runCf(["--help"]);
		return std.getAndClearErr();
	}

	it("shows the hint on the first run only", async () => {
		expect(await runHelp()).toContain(HINT);
		expect(await runHelp()).not.toContain("cf complete <");
	});

	it("does not show the hint when cf cannot record that it was shown", async () => {
		const configPath = getCfConfigPath();
		mkdirSync(dirname(configPath), { recursive: true });
		writeFileSync(configPath, "");

		expect(await runHelp()).not.toContain("cf complete <");
	});

	it("does not show or use up the hint in CI with a pseudo-TTY", async () => {
		runtime.isCI = true;
		expect(await runHelp()).not.toContain("cf complete <");

		runtime.isCI = false;
		expect(await runHelp()).toContain(HINT);
	});
});
