import { format } from "node:util";
import { normalizeString } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, beforeEach, onTestFinished, vi } from "vite-plus/test";

/**
 * Capture a command's output streams.
 *
 * Command tests assert on stdout (JSON payloads, help text) and stderr
 * (spinners, `✓` lines, warnings) constantly; every one of them was
 * hand-rolling the same three spies. Call in `beforeEach` and read the
 * accessors afterwards — `vi.restoreAllMocks()` (or vitest's
 * `restoreMocks`) undoes the spies.
 */
export function captureOutput(): {
	stdout: () => string;
	stderr: () => string;
	clear: () => void;
} {
	const log = vi.spyOn(console, "log").mockImplementation(() => {});
	const err = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
	const joined = (spy: typeof log, separator: string) =>
		spy.mock.calls.map((call: unknown[]) => String(call[0])).join(separator);
	return {
		stdout: () => joined(log, "\n"),
		stderr: () => joined(err as unknown as typeof log, ""),
		clear: () => {
			log.mockClear();
			err.mockClear();
		},
	};
}

/**
 * Capture everything written to each stream, like `mockConsoleMethods`.
 *
 * Console calls and direct stream writes (clack lines, `✓` success lines,
 * raw payloads) share one buffer per stream, so a test can assert that
 * stdout holds only the command's output. Call at `describe` level; output
 * is normalized the same way as `mockConsoleMethods`.
 */
export function mockOutputStreams(): {
	readonly out: string;
	readonly err: string;
	getAndClearOut: () => string;
	getAndClearErr: () => string;
} {
	let out = "";
	let err = "";
	let spies: { mockRestore: () => void }[] = [];
	const toOut = (...args: unknown[]) => {
		out += `${format(...args)}\n`;
	};
	const toErr = (...args: unknown[]) => {
		err += `${format(...args)}\n`;
	};

	beforeEach(() => {
		out = "";
		err = "";
		spies = [
			vi.spyOn(console, "log").mockImplementation(toOut),
			vi.spyOn(console, "info").mockImplementation(toOut),
			vi.spyOn(console, "debug").mockImplementation(toOut),
			vi.spyOn(console, "warn").mockImplementation(toErr),
			vi.spyOn(console, "error").mockImplementation(toErr),
			vi.spyOn(process.stdout, "write").mockImplementation((chunk) => {
				out += String(chunk);
				return true;
			}),
			vi.spyOn(process.stderr, "write").mockImplementation((chunk) => {
				err += String(chunk);
				return true;
			}),
		];
	});
	afterEach(() => {
		for (const spy of spies) {
			spy.mockRestore();
		}
	});

	const read = (buffer: string) => normalizeString(buffer).replace(/\n+$/, "");
	return {
		get out() {
			return read(out);
		},
		get err() {
			return read(err);
		},
		getAndClearOut: () => {
			const value = read(out);
			out = "";
			return value;
		},
		getAndClearErr: () => {
			const value = read(err);
			err = "";
			return value;
		},
	};
}

/** Treat stderr as a terminal for the rest of the test. */
export function stubStderrTTY(): void {
	const original = Object.getOwnPropertyDescriptor(process.stderr, "isTTY");
	Object.defineProperty(process.stderr, "isTTY", {
		configurable: true,
		value: true,
	});
	onTestFinished(() => {
		if (original) {
			Object.defineProperty(process.stderr, "isTTY", original);
		} else {
			Reflect.deleteProperty(process.stderr, "isTTY");
		}
	});
}
