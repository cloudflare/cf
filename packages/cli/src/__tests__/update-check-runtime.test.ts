import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as updateCheck from "../lib/update-check.js";
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

		await runCf(["--version"]);

		expect(output.stdout()).toContain("update available: v1.3.0");
		expect(updateCheck.getUpdateNotice).toHaveBeenCalledOnce();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).toHaveBeenCalledOnce();
	});

	it("does not load or refresh update state for non-interactive output", async () => {
		setTTY(false, false);
		const output = captureOutput();

		await runCf(["--version"]);

		expect(output.stdout()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("does not load or refresh update state when quiet", async () => {
		setTTY(true, true);
		const output = captureOutput();

		await runCf(["--version", "--quiet"]);

		expect(output.stdout()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("does not load or refresh update state in CI with a pseudo-TTY", async () => {
		runtime.isCI = true;
		setTTY(true, true);
		const output = captureOutput();

		await runCf(["--version"]);

		expect(output.stdout()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it.each([
		["string value", ["--profile", "work"]],
		["boolean true", ["--local", "true"]],
		["boolean false", ["--local", "false"]],
		["aliased boolean true", ["-q", "true"]],
		["aliased boolean false", ["-q", "false"]],
		["bare boolean", ["--local"]],
	])("skips update state for completion after %s", async (_name, flags) => {
		setTTY(true, true);
		const output = captureOutput();

		await runCf([...flags, "complete", "bash", "--help"]);

		expect(output.stdout()).toContain("cf complete [shell]");
		expect(output.stderr()).not.toContain("update available");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("runs completion with a positional after an explicit boolean value", async () => {
		setTTY(true, true);
		const output = captureOutput();

		await runCf(["--local", "false", "complete", "bash"]);

		expect(output.stdout()).toContain("bash");
		expect(updateCheck.getUpdateNotice).not.toHaveBeenCalled();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).not.toHaveBeenCalled();
	});

	it("does not mistake a global option value for the completion command", async () => {
		setTTY(true, true);
		captureOutput();

		await runCf(["--profile", "complete", "--version"]);

		expect(updateCheck.getUpdateNotice).toHaveBeenCalledOnce();
		expect(updateCheck.maybeStartBackgroundUpdateCheck).toHaveBeenCalledOnce();
	});
});
