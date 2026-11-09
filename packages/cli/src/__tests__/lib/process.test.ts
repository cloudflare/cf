import * as childProcess from "node:child_process";
import { EventEmitter } from "node:events";
import { afterEach, describe, it, vi } from "vite-plus/test";
import { createChildProcessController } from "../../lib/process.js";
import type { ChildProcess } from "node:child_process";

vi.mock("node:child_process", { spy: true });

function createMockProcess(): {
	child: ChildProcess;
	kill: ReturnType<typeof vi.fn>;
} {
	const kill = vi.fn(() => true);
	const child = new EventEmitter() as ChildProcess;
	Object.assign(child, {
		exitCode: null,
		signalCode: null,
		kill,
	});
	return { child, kill };
}

function exit(
	child: ChildProcess,
	code: number | null,
	signal: NodeJS.Signals | null
): void {
	Object.assign(child, { exitCode: code, signalCode: signal });
	child.emit("exit", code, signal);
}

function addedSignalListener(
	signal: "SIGINT" | "SIGTERM",
	before: Set<NodeJS.SignalsListener>
): NodeJS.SignalsListener {
	const listener = process
		.listeners(signal)
		.find((candidate) => !before.has(candidate as NodeJS.SignalsListener));
	if (!listener) {
		throw new Error(`No ${signal} listener was added`);
	}
	return listener as NodeJS.SignalsListener;
}

afterEach(() => {
	vi.useRealTimers();
	vi.restoreAllMocks();
});

describe("createChildProcessController", () => {
	it("reports the child process exit", async ({ expect }) => {
		const { child } = createMockProcess();
		const controller = createChildProcessController(child);

		exit(child, 23, null);

		await expect(controller.exited).resolves.toEqual({
			code: 23,
			signal: null,
		});
	});

	it("reports a child that already exited", async ({ expect }) => {
		const { child } = createMockProcess();
		Object.assign(child, { exitCode: null, signalCode: "SIGTERM" });

		const controller = createChildProcessController(child);

		await expect(controller.exited).resolves.toEqual({
			code: null,
			signal: "SIGTERM",
		});
		expect(child.listenerCount("exit")).toBe(0);
	});

	it("forwards signals and force kills on a second signal", async ({
		expect,
	}) => {
		vi.spyOn(process, "platform", "get").mockReturnValue("linux");
		const { child, kill } = createMockProcess();
		const sigintListeners = new Set<NodeJS.SignalsListener>(
			process.listeners("SIGINT") as NodeJS.SignalsListener[]
		);
		const controller = createChildProcessController(child, {
			forwardSignals: true,
		});
		const onSigInt = addedSignalListener("SIGINT", sigintListeners);

		onSigInt("SIGINT");
		onSigInt("SIGINT");

		expect(controller.terminationRequested).toBe(true);
		expect(kill).toHaveBeenNthCalledWith(1, "SIGINT");
		expect(kill).toHaveBeenNthCalledWith(2, "SIGKILL");
		exit(child, null, "SIGKILL");
		await controller.exited;
	});

	it("does not relay SIGINT on Windows", async ({ expect }) => {
		vi.spyOn(process, "platform", "get").mockReturnValue("win32");
		const { child, kill } = createMockProcess();
		const sigintListeners = new Set<NodeJS.SignalsListener>(
			process.listeners("SIGINT") as NodeJS.SignalsListener[]
		);
		const controller = createChildProcessController(child, {
			forwardSignals: true,
		});
		const onSigInt = addedSignalListener("SIGINT", sigintListeners);

		onSigInt("SIGINT");
		onSigInt("SIGINT");

		expect(controller.terminationRequested).toBe(false);
		expect(kill).not.toHaveBeenCalled();
		exit(child, 0, null);
		await controller.exited;
	});

	it("signals a POSIX command group, including the forced-shutdown fallback", async ({
		expect,
	}) => {
		vi.useFakeTimers();
		vi.spyOn(process, "platform", "get").mockReturnValue("linux");
		const signalGroup = vi.spyOn(process, "kill").mockReturnValue(true);
		const { child, kill } = createMockProcess();
		Object.assign(child, { pid: 12345 });
		const controller = createChildProcessController(child, {
			processGroup: true,
			forceKillAfterMs: 100,
		});

		controller.terminate();
		await vi.advanceTimersByTimeAsync(100);

		expect(signalGroup).toHaveBeenNthCalledWith(1, -12345, "SIGTERM");
		expect(signalGroup).toHaveBeenNthCalledWith(2, -12345, "SIGKILL");
		expect(kill).not.toHaveBeenCalled();
		exit(child, null, "SIGKILL");
		await controller.exited;
	});

	it("ignores a POSIX group that already exited", async ({ expect }) => {
		vi.spyOn(process, "platform", "get").mockReturnValue("linux");
		vi.spyOn(process, "kill").mockImplementation(() => {
			throw Object.assign(new Error("No such process"), { code: "ESRCH" });
		});
		const { child } = createMockProcess();
		Object.assign(child, { pid: 12345 });
		const controller = createChildProcessController(child, {
			processGroup: true,
		});

		expect(() => controller.terminate()).not.toThrow();
		exit(child, 0, null);
		await controller.exited;
	});

	it("terminates a Windows command tree without a shell", async ({
		expect,
	}) => {
		vi.spyOn(process, "platform", "get").mockReturnValue("win32");
		const taskkill = vi.spyOn(childProcess, "execFileSync").mockReturnValue("");
		const { child, kill } = createMockProcess();
		Object.assign(child, { pid: 12345 });
		const controller = createChildProcessController(child, {
			processGroup: true,
		});

		controller.terminate();

		expect(taskkill).toHaveBeenCalledWith(
			"taskkill.exe",
			["/PID", "12345", "/T", "/F"],
			{ stdio: "ignore", windowsHide: true, timeout: 5_000 }
		);
		expect(kill).not.toHaveBeenCalled();
		exit(child, null, "SIGTERM");
		await controller.exited;
	});

	it("terminates idempotently and force kills after the deadline", async ({
		expect,
	}) => {
		vi.useFakeTimers();
		const { child, kill } = createMockProcess();
		const controller = createChildProcessController(child, {
			forceKillAfterMs: 100,
		});

		controller.terminate();
		controller.terminate();
		expect(kill).toHaveBeenCalledOnce();
		await vi.advanceTimersByTimeAsync(100);

		expect(kill).toHaveBeenNthCalledWith(1, "SIGTERM");
		expect(kill).toHaveBeenNthCalledWith(2, "SIGKILL");
		exit(child, null, "SIGKILL");
		await controller.exited;
	});

	it("can leave graceful shutdown timing to the child", async ({ expect }) => {
		vi.useFakeTimers();
		const { child, kill } = createMockProcess();
		const controller = createChildProcessController(child, {
			forceKillAfterMs: null,
		});

		controller.terminate();

		expect(kill).toHaveBeenCalledOnce();
		expect(vi.getTimerCount()).toBe(0);
		exit(child, 0, null);
		await controller.exited;
	});

	it("clears a pending forced-shutdown timer when the child exits", async ({
		expect,
	}) => {
		vi.useFakeTimers();
		const { child } = createMockProcess();
		const controller = createChildProcessController(child);

		controller.terminate();
		expect(vi.getTimerCount()).toBe(1);
		exit(child, 0, null);
		await controller.exited;

		expect(vi.getTimerCount()).toBe(0);
	});

	it("rejects process errors and removes signal listeners", async ({
		expect,
	}) => {
		const { child } = createMockProcess();
		const sigintCount = process.listenerCount("SIGINT");
		const sigtermCount = process.listenerCount("SIGTERM");
		const controller = createChildProcessController(child, {
			forwardSignals: true,
		});

		child.emit("error", new Error("spawn failed"));

		await expect(controller.exited).rejects.toThrow("spawn failed");
		expect(process.listenerCount("SIGINT")).toBe(sigintCount);
		expect(process.listenerCount("SIGTERM")).toBe(sigtermCount);
		expect(child.listenerCount("exit")).toBe(0);
	});
});
