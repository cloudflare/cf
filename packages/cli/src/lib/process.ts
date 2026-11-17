import { execFileSync } from "node:child_process";
import type { ChildProcess } from "node:child_process";

const DEFAULT_FORCE_KILL_AFTER_MS = 5_000;

export interface ChildProcessControllerOptions {
	/** Forward SIGINT and SIGTERM until shutdown completes. */
	forwardSignals?: boolean;
	/** Control the whole command tree; POSIX children must use `detached: true`. */
	processGroup?: boolean;
	/**
	 * Time to wait after requesting shutdown before sending SIGKILL.
	 * Set to `null` to leave graceful shutdown timing to the child.
	 */
	forceKillAfterMs?: number | null;
}

export interface ChildProcessExit {
	code: number | null;
	signal: NodeJS.Signals | null;
}

export interface ChildProcessController {
	/** Rejects on a process error; otherwise resolves when the child exits. */
	exited: Promise<ChildProcessExit>;
	readonly terminationRequested: boolean;
	/** Request shutdown; explicit SIGKILL also overrides a pending graceful shutdown. */
	terminate(signal?: NodeJS.Signals): void;
	/** Wait for requested POSIX group shutdown, including surviving descendants. */
	waitForShutdown(): Promise<void>;
}

/**
 * Observe and control an existing child process.
 */
export function createChildProcessController(
	child: ChildProcess,
	options: ChildProcessControllerOptions = {}
): ChildProcessController {
	let terminationRequested = false;
	let forceKillTimer: NodeJS.Timeout | undefined;
	let groupCheckTimer: NodeJS.Timeout | undefined;
	let shutdown: Promise<void> | undefined;
	let resolveShutdown: (() => void) | undefined;
	let childExited = child.exitCode !== null || child.signalCode !== null;
	const posixGroup =
		options.processGroup &&
		process.platform !== "win32" &&
		child.pid !== undefined;
	const forceKillAfterMs =
		options.forceKillAfterMs === undefined
			? DEFAULT_FORCE_KILL_AFTER_MS
			: options.forceKillAfterMs;
	const kill = (signal: NodeJS.Signals): void => {
		if (!options.processGroup || child.pid === undefined) {
			child.kill(signal);
			return;
		}
		if (process.platform === "win32") {
			// Windows has no POSIX process groups or graceful SIGTERM. Kill the
			// tree before its launcher exits and leaves the actual tool running.
			try {
				execFileSync("taskkill.exe", ["/PID", String(child.pid), "/T", "/F"], {
					stdio: "ignore",
					windowsHide: true,
					timeout: 5_000,
				});
			} catch {
				child.kill(signal);
			}
			return;
		}
		try {
			process.kill(-child.pid, signal);
		} catch (error) {
			if (
				!(error instanceof Error && "code" in error && error.code === "ESRCH")
			) {
				throw error;
			}
		}
	};
	const finishShutdown = (): void => {
		clearTimeout(forceKillTimer);
		clearTimeout(groupCheckTimer);
		resolveShutdown?.();
		resolveShutdown = undefined;
		if (childExited) {
			cleanup();
		}
	};
	const checkGroup = (): void => {
		if (child.pid === undefined) {
			finishShutdown();
			return;
		}
		try {
			process.kill(-child.pid, 0);
		} catch (error) {
			if (error instanceof Error && "code" in error && error.code === "ESRCH") {
				finishShutdown();
				return;
			}
		}
		groupCheckTimer = setTimeout(checkGroup, 50);
	};

	const terminate = (signal: NodeJS.Signals = "SIGTERM"): void => {
		if (
			(!posixGroup && childExited) ||
			(terminationRequested && signal !== "SIGKILL")
		) {
			return;
		}

		terminationRequested = true;
		kill(signal);
		if (signal === "SIGKILL") {
			finishShutdown();
			return;
		}
		if (posixGroup) {
			shutdown = new Promise<void>((resolve) => {
				resolveShutdown = resolve;
			});
		}
		if (forceKillAfterMs !== null) {
			forceKillTimer = setTimeout(() => {
				if (posixGroup || !childExited) {
					kill("SIGKILL");
				}
				finishShutdown();
			}, forceKillAfterMs);
			if (!posixGroup) {
				forceKillTimer.unref();
			}
		}
		if (posixGroup && childExited) {
			checkGroup();
		}
	};

	const forwardSignal = (signal: NodeJS.Signals): void => {
		// Windows broadcasts Ctrl+C to every process sharing the console.
		// Relaying it would forcefully terminate the child before its own
		// SIGINT handler can finish graceful shutdown.
		if (process.platform === "win32" && signal === "SIGINT") {
			return;
		}
		if (terminationRequested) {
			terminate("SIGKILL");
			return;
		}
		terminate(signal);
	};
	const onSigInt = (): void => forwardSignal("SIGINT");
	const onSigTerm = (): void => forwardSignal("SIGTERM");
	const cleanup = (): void => {
		clearTimeout(forceKillTimer);
		clearTimeout(groupCheckTimer);
		process.removeListener("SIGINT", onSigInt);
		process.removeListener("SIGTERM", onSigTerm);
		child.removeListener("error", onError);
		child.removeListener("exit", onExit);
	};

	let resolveExit!: (result: ChildProcessExit) => void;
	let rejectExit!: (error: Error) => void;
	const exited = new Promise<ChildProcessExit>((resolve, reject) => {
		resolveExit = resolve;
		rejectExit = reject;
	});
	const onError = (error: Error): void => {
		finishShutdown();
		cleanup();
		rejectExit(error);
	};
	const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
		childExited = true;
		// The launcher can exit while descendants still own the dev-server port.
		if (resolveShutdown) {
			checkGroup();
		} else {
			cleanup();
		}
		resolveExit({ code, signal });
	};

	if (childExited) {
		resolveExit({ code: child.exitCode, signal: child.signalCode });
	} else {
		child.once("error", onError);
		child.once("exit", onExit);
		if (options.forwardSignals) {
			process.on("SIGINT", onSigInt);
			process.on("SIGTERM", onSigTerm);
		}
	}

	// A caller may use only terminate(); keep a later process error from becoming
	// an unhandled rejection while preserving it for consumers that await exit.
	void exited.catch(() => {});

	return {
		exited,
		get terminationRequested() {
			return terminationRequested;
		},
		terminate,
		waitForShutdown: () => shutdown ?? Promise.resolve(),
	};
}
