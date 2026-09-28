import { Readable } from "node:stream";
import { afterEach, beforeEach } from "vitest";

const ORIGINAL_STDOUT = process.stdout;
const ORIGINAL_STDIN = process.stdin;

/**
 * Build a Readable that's already closed — `for await` over it yields
 * zero chunks and resolves immediately. Used when setIsTTY(false) so
 * that any cf code that does `for await (const chunk of process.stdin)`
 * to detect piped input doesn't hang waiting for EOF on the real
 * (unattached) test-runner stdin.
 */
function emptyClosedStdin() {
	const stream = Readable.from([]) as Readable & { isTTY?: boolean };
	stream.isTTY = false;
	return stream;
}

/**
 * Mock `process.stdout.isTTY`
 */
export function useMockIsTTY() {
	/**
	 * Explicitly set `process.stdout.isTTY` to a given value (or to a getter function).
	 */
	const setIsTTY = (
		isTTY:
			| boolean
			| { stdin: boolean | (() => boolean); stdout: boolean | (() => boolean) }
	) => {
		mockStdStream("stdout", ORIGINAL_STDOUT, isTTY);
		// For non-TTY stdin specifically, swap in an empty-closed Readable
		// so cf's piped-input detection (`for await (const chunk of
		// process.stdin)`) returns immediately rather than hanging.
		const stdinFlag =
			typeof isTTY === "boolean" ? isTTY : (isTTY as { stdin: unknown }).stdin;
		if (stdinFlag === false) {
			Object.defineProperty(process, "stdin", { value: emptyClosedStdin() });
		} else {
			mockStdStream("stdin", ORIGINAL_STDIN, isTTY);
		}
	};

	beforeEach(() => {
		Object.defineProperty(process, "stdout", { value: ORIGINAL_STDOUT });
		Object.defineProperty(process, "stdin", { value: ORIGINAL_STDIN });
	});

	afterEach(() => {
		Object.defineProperty(process, "stdout", { value: ORIGINAL_STDOUT });
		Object.defineProperty(process, "stdin", { value: ORIGINAL_STDIN });
	});

	return { setIsTTY };
}

/**
 * Create a mock version of the specified stream which overrides `isTTY`
 * with the given mock responses.
 *
 * @param streamName the property name on `process` for the stream to be mocked.
 * @param originalStream the original stream object from the `process` object to be overridden.
 * @param isTTY the mock behaviour for the `isTTY` property:
 *  - boolean or `{ [streamName]: boolean } - use this value for isTTY;
 *  - { [streamName]: () => boolean } - use this function as a getter for isTTY.
 */
function mockStdStream<T extends object>(
	streamName: "stdout" | "stdin",
	originalStream: T,
	isTTY:
		| boolean
		| { stdin: boolean | (() => boolean); stdout: boolean | (() => boolean) }
) {
	Object.defineProperty(process, streamName, {
		value: createStdProxy(
			originalStream,
			typeof isTTY === "boolean" ? isTTY : isTTY[streamName]
		),
	});
}

/**
 * Create a proxy wrapper around the given `stream` object that overrides the `isTTY` property.
 */
function createStdProxy<T extends object>(
	stream: T,
	isTTY: boolean | (() => boolean)
): T {
	return new Proxy(stream, {
		get(target, prop) {
			return prop === "isTTY"
				? typeof isTTY === "boolean"
					? isTTY
					: isTTY()
				: target[prop as keyof typeof target];
		},
	});
}
