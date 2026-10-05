import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { OscProgressState, terminalProgress } from "../../lib/osc-progress.js";

describe("osc-progress", () => {
	let originalStderrIsTTY: boolean | undefined;
	let originalArgv: string[];
	let stderrWrite: string[];
	let stdoutWrite: string[];

	beforeEach(() => {
		originalArgv = process.argv;
		originalStderrIsTTY = process.stderr.isTTY;

		stderrWrite = [];
		stdoutWrite = [];

		vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
			stderrWrite.push(String(chunk));
			return true;
		});
		vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
			stdoutWrite.push(String(chunk));
			return true;
		});

		Object.defineProperty(process.stderr, "isTTY", {
			configurable: true,
			value: true,
		});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		process.argv = originalArgv;

		Object.defineProperty(process.stderr, "isTTY", {
			configurable: true,
			value: originalStderrIsTTY,
		});
	});

	it("does not write for unsupported terminals", () => {
		vi.stubEnv("TERM_PROGRAM", "unknown");

		terminalProgress.setIndeterminate();

		expect(stderrWrite).toEqual([]);
		expect(stdoutWrite).toEqual([]);
	});

	it("does not register exit cleanup for unsupported terminals", async () => {
		vi.resetModules();
		vi.stubEnv("TERM_PROGRAM", "unknown");
		const processOn = vi.spyOn(process, "on");
		const { terminalProgress: freshTerminalProgress } =
			await import("../../lib/osc-progress.js");

		freshTerminalProgress.setIndeterminate();

		expect(processOn).not.toHaveBeenCalledWith("exit", expect.any(Function));
	});

	it("can be disabled with `CF_NO_OSC_PROGRESS`", () => {
		vi.stubEnv("CF_NO_OSC_PROGRESS", "1");
		vi.stubEnv("TERM_PROGRAM", "ghostty");

		terminalProgress.setIndeterminate();

		expect(stderrWrite).toEqual([]);
	});

	it("can be disabled with --quiet", () => {
		process.argv = ["node", "cf", "kv", "bulk", "delete", "--quiet"];
		vi.stubEnv("TERM_PROGRAM", "ghostty");

		terminalProgress.setIndeterminate();

		expect(stderrWrite).toEqual([]);
	});

	it("writes indeterminate progress", () => {
		vi.stubEnv("TERM_PROGRAM", "WezTerm");

		terminalProgress.setIndeterminate();

		expect(stderrWrite).toContain(
			`\x1b]9;4;${OscProgressState.Indeterminate};0\x07`
		);
	});

	it("supports an explicit force opt-in", () => {
		vi.stubEnv("CF_FORCE_OSC_PROGRESS", "1");

		terminalProgress.setIndeterminate();

		expect(stderrWrite).toContain(
			`\x1b]9;4;${OscProgressState.Indeterminate};0\x07`
		);
	});
});
