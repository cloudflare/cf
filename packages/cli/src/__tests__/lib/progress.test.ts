import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { terminalProgress } from "../../lib/osc-progress.js";
import { withProgress } from "../../lib/progress.js";

vi.mock("@clack/prompts", () => ({
	spinner: () => ({
		error: vi.fn(),
		start: vi.fn(),
		stop: vi.fn(),
	}),
}));

describe("withProgress", () => {
	const originalStdoutIsTTY = process.stdout.isTTY;

	beforeEach(() => {
		vi.stubEnv("NO_COLOR", undefined);
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: true,
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
		Object.defineProperty(process.stdout, "isTTY", {
			configurable: true,
			value: originalStdoutIsTTY,
		});
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
