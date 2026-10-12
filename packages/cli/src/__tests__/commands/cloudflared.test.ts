import { spawnCloudflared } from "@cloudflare/workers-utils";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../commands/cloudflared.js";
import { createChildProcessController } from "../../lib/process.js";
import type { ChildProcess } from "node:child_process";

vi.mock("@cloudflare/workers-utils", () => ({
	spawnCloudflared: vi.fn(),
}));

vi.mock("../../lib/process.js", () => ({
	createChildProcessController: vi.fn(),
}));

const child = {} as ChildProcess;

function arrangeExit(code: number | null, signal: NodeJS.Signals | null): void {
	vi.mocked(spawnCloudflared).mockResolvedValueOnce(child);
	vi.mocked(createChildProcessController).mockReturnValueOnce({
		exited: Promise.resolve({ code, signal }),
		terminationRequested: false,
		terminate: vi.fn(),
	});
}

describe("runCloudflared", () => {
	beforeEach(() => {
		vi.mocked(spawnCloudflared).mockReset();
		vi.mocked(createChildProcessController).mockReset();
	});

	it("spawns the managed binary and controls its lifecycle", async () => {
		arrangeExit(0, null);

		await expect(
			runCloudflared(["tunnel", "--url", "http://localhost:3000"], {
				env: { TUNNEL_TOKEN: "secret" },
				forceKillAfterMs: 123,
			})
		).resolves.toBe(0);

		expect(spawnCloudflared).toHaveBeenCalledWith(
			["--no-autoupdate", "tunnel", "--url", "http://localhost:3000"],
			expect.objectContaining({
				stdio: "inherit",
				env: { TUNNEL_TOKEN: "secret" },
			})
		);
		expect(createChildProcessController).toHaveBeenCalledWith(child, {
			forwardSignals: true,
			forceKillAfterMs: 123,
		});
	});

	it("does not log forwarded arguments that may contain credentials", async () => {
		vi.stubEnv("DEBUG", "1");
		const error = vi.spyOn(console, "error").mockImplementation(() => {});
		arrangeExit(0, null);

		await runCloudflared(["access", "curl", "--header", "secret"]);

		const options = vi.mocked(spawnCloudflared).mock.calls[0]?.[1];
		options?.logger?.debug(
			"Spawning cloudflared: cloudflared access curl --header secret"
		);
		options?.logger?.debug("Using cached cloudflared");
		expect(error).toHaveBeenCalledOnce();
		expect(error).toHaveBeenCalledWith("Using cached cloudflared");
		error.mockRestore();
	});

	it.each([
		[{ code: 23, signal: null }, 23],
		[{ code: null, signal: "SIGINT" }, 130],
		[{ code: null, signal: "SIGTERM" }, 143],
		[{ code: null, signal: null }, 1],
	] as const)("maps exit state $0 to status $1", async (exit, expected) => {
		arrangeExit(exit.code, exit.signal);

		await expect(runCloudflared([])).resolves.toBe(expected);
	});

	it("propagates process errors", async () => {
		vi.mocked(spawnCloudflared).mockResolvedValueOnce(child);
		vi.mocked(createChildProcessController).mockReturnValueOnce({
			exited: Promise.reject(new Error("spawn failed")),
			terminationRequested: false,
			terminate: vi.fn(),
		});

		await expect(runCloudflared([])).rejects.toThrow("spawn failed");
	});
});
