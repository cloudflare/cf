import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as updateCheck from "../lib/update-check.js";
import { VERSION } from "../version.js";
import { captureOutput } from "./helpers/capture-output.js";
import { runCf } from "./helpers/run-cf.js";

const runtime = vi.hoisted(() => ({ isCI: false }));

vi.mock("../lib/interactive.js", () => ({
	get isCI() {
		return runtime.isCI;
	},
}));

vi.mock("../lib/update-check.js", () => ({
	getUpdateNotice: vi.fn(),
	maybeStartBackgroundUpdateCheck: vi.fn(),
}));

describe("update check runtime", () => {
	const stdoutTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
	const stderrTTY = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");

	function setTTY(stdout: boolean, stderr: boolean): void {
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: stdout,
		});
		Object.defineProperty(process.stderr, "isTTY", {
			configurable: true,
			value: stderr,
		});
	}

	beforeEach(() => {
		vi.restoreAllMocks();
		runtime.isCI = false;
		vi.mocked(updateCheck.getUpdateNotice).mockReset();
		vi.mocked(updateCheck.maybeStartBackgroundUpdateCheck).mockReset();
	});

	afterAll(() => {
		if (stdoutTTY) {
			Object.defineProperty(process.stdout, "isTTY", stdoutTTY);
		} else {
			Reflect.deleteProperty(process.stdout, "isTTY");
		}
		if (stderrTTY) {
			Object.defineProperty(process.stderr, "isTTY", stderrTTY);
		} else {
			Reflect.deleteProperty(process.stderr, "isTTY");
		}
	});

	it("renders cached update information before detaching a refresh", async () => {
		setTTY(true, true);
		const output = captureOutput();
		vi.mocked(updateCheck.getUpdateNotice).mockReturnValue({
			latestVersion: "1.3.0",
			isMajor: false,
		});

		await runCf([]);

		expect(output.stdout()).toContain("update available: v1.3.0");
		expect(updateCheck.getUpdateNotice).toHaveBeenCalledOnce();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).toHaveBeenCalledOnce();
	});

	it("does not load or refresh update state for non-interactive output", async () => {
		setTTY(false, false);
		const output = captureOutput();

		await runCf([]);

		expect(output.stdout()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("prints the interactive version banner to stderr and the number to stdout", async () => {
		setTTY(true, true);
		const output = captureOutput();
		vi.mocked(updateCheck.getUpdateNotice).mockReturnValue({
			latestVersion: "1.3.0",
			isMajor: false,
		});

		await runCf(["--version"]);

		expect(output.stdout()).toBe(VERSION);
		expect(output.stderr()).toContain("🍊☁️");
		expect(output.stderr()).toContain(`v${VERSION}`);
		expect(output.stderr()).toContain("update available: v1.3.0");
		expect(updateCheck.getUpdateNotice).toHaveBeenCalledOnce();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).toHaveBeenCalledOnce();
	});

	it.each([
		["-v", ["-v"], false],
		["--version --quiet", ["--version", "--quiet"], true],
		["-q -v", ["-q", "-v"], true],
	])("keeps stdout parseable for %s", async (_label, args, tty) => {
		setTTY(tty, tty);
		const output = captureOutput();

		await runCf(args);

		expect(output.stdout()).toBe(VERSION);
		expect(output.stderr()).toBe("");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("does not load or refresh update state in CI with a pseudo-TTY", async () => {
		runtime.isCI = true;
		setTTY(true, true);
		const output = captureOutput();

		await runCf([]);

		expect(output.stdout()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("skips update state for completion after a global option value", async () => {
		setTTY(true, true);
		const output = captureOutput();

		await runCf(["--profile", "work", "complete", "--help"]);

		expect(output.stderr()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("does not mistake a global option value for the completion command", async () => {
		setTTY(true, true);
		captureOutput();

		await runCf(["--profile", "complete", "--help"]);

		expect(updateCheck.getUpdateNotice).toHaveBeenCalledOnce();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).toHaveBeenCalledOnce();
	});
});
