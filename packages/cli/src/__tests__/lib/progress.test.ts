import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { terminalProgress } from "../../lib/osc-progress.js";
import { withProgress } from "../../lib/progress.js";

const spinner = vi.hoisted(() =>
	vi.fn(() => ({
		error: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
	}))
);
vi.mock("@clack/prompts", () => ({ spinner }));

const ciInfo = vi.hoisted(() => ({ isCI: false }));
vi.mock("ci-info", () => ({ default: ciInfo }));

describe("withProgress", () => {
	const originalStdinIsTTY = process.stdin.isTTY;
	const originalStdoutIsTTY = process.stdout.isTTY;
	const originalStderrIsTTY = process.stderr.isTTY;
	const setTTY = (
		stream: NodeJS.ReadStream | NodeJS.WriteStream,
		value: boolean | undefined
	) => Object.defineProperty(stream, "isTTY", { configurable: true, value });

	beforeEach(() => {
		vi.stubEnv("NO_COLOR", undefined);
		vi.stubEnv("FORCE_COLOR", undefined);
		setTTY(process.stdin, true);
		setTTY(process.stderr, true);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		spinner.mockClear();
		ciInfo.isCI = false;
		setTTY(process.stdin, originalStdinIsTTY);
		setTTY(process.stdout, originalStdoutIsTTY);
		setTTY(process.stderr, originalStderrIsTTY);
	});

	it("draws on stderr while stdout is redirected", async () => {
		setTTY(process.stdout, false);
		vi.spyOn(terminalProgress, "setIndeterminate").mockImplementation(() => {});
		vi.spyOn(terminalProgress, "clear").mockImplementation(() => {});

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(spinner).toHaveBeenCalledWith(
			expect.objectContaining({ output: process.stderr })
		);
	});

	it("does not draw when stderr is not a terminal", async () => {
		setTTY(process.stdout, true);
		setTTY(process.stderr, false);

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(spinner).not.toHaveBeenCalled();
	});

	it("does not draw when stdin is piped", async () => {
		setTTY(process.stdin, false);

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(spinner).not.toHaveBeenCalled();
	});

	it("does not draw in CI", async () => {
		ciInfo.isCI = true;

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(spinner).not.toHaveBeenCalled();
	});

	it("exits as SIGINT and SIGTERM would while drawing", async () => {
		vi.spyOn(terminalProgress, "setIndeterminate").mockImplementation(() => {});
		vi.spyOn(terminalProgress, "clear").mockImplementation(() => {});
		const exit = vi
			.spyOn(process, "exit")
			.mockImplementation(() => undefined as never);
		let finish = () => {};
		const running = withProgress(
			"Loading",
			() => new Promise<void>((resolve) => (finish = resolve))
		);

		process.emit("SIGINT", "SIGINT");
		process.emit("SIGTERM", "SIGTERM");
		finish();
		await running;
		process.emit("SIGINT", "SIGINT");

		expect(exit.mock.calls).toEqual([[130], [143]]);
	});

	it("exits 130 when Ctrl+C or Esc ends the process while drawing", async () => {
		vi.spyOn(terminalProgress, "setIndeterminate").mockImplementation(() => {});
		vi.spyOn(terminalProgress, "clear").mockImplementation(() => {});
		let finish = () => {};
		const running = withProgress(
			"Loading",
			() => new Promise<void>((resolve) => (finish = resolve))
		);

		// clack's spinner exits 0 when it reads Ctrl+C or Esc as a keypress.
		process.emit("exit", 0);
		const exitCode = process.exitCode;
		process.exitCode = undefined;
		finish();
		await running;

		expect(exitCode).toBe(130);
	});

	it("does not set OSC progress when animation is disabled", async () => {
		vi.stubEnv("NO_COLOR", "1");
		const setIndeterminate = vi
			.spyOn(terminalProgress, "setIndeterminate")
			.mockImplementation(() => {});
		const clear = vi
			.spyOn(terminalProgress, "clear")
			.mockImplementation(() => {});

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(setIndeterminate).not.toHaveBeenCalled();
		expect(clear).not.toHaveBeenCalled();
	});

	it("sets indeterminate OSC progress and clears on success", async () => {
		const setIndeterminate = vi
			.spyOn(terminalProgress, "setIndeterminate")
			.mockImplementation(() => {});
		const clear = vi
			.spyOn(terminalProgress, "clear")
			.mockImplementation(() => {});

		await expect(withProgress("Loading", async () => "ok")).resolves.toBe("ok");

		expect(setIndeterminate).toHaveBeenCalledOnce();
		expect(clear).toHaveBeenCalledOnce();
	});

	it("clears OSC progress and rethrows on failure", async () => {
		const clear = vi
			.spyOn(terminalProgress, "clear")
			.mockImplementation(() => {});

		await expect(
			withProgress("Loading", async () => {
				throw new Error("boom");
			})
		).rejects.toThrow("boom");

		expect(clear).toHaveBeenCalledOnce();
	});
});
