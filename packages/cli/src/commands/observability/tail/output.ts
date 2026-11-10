import { MAX_BUFFER_BYTES } from "./events.js";
import type { Writable } from "node:stream";

export function tailOutput(output: Writable, shutdownTimeoutMs: number) {
	const controller = new AbortController();
	let pendingWrites = 0;
	let failure: Error | undefined;
	let finishDrain: (() => void) | undefined;
	let draining = false;

	const onClose = () => controller.abort();
	const onError = (error: unknown) => {
		if (
			!(
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "EPIPE"
			)
		) {
			failure ??= new Error("Could not write live tail events to stdout.");
		}
		controller.abort();
	};
	const cleanup = () => {
		if (pendingWrites === 0) {
			output.off("error", onError);
			output.off("close", onClose);
			finishDrain?.();
		}
	};
	const onWriteComplete = () => {
		pendingWrites--;
		if (draining && pendingWrites === 0) {
			// Writable emits errors after invoking its write callbacks.
			setImmediate(cleanup);
		}
	};
	output.on("error", onError);
	output.on("close", onClose);
	return {
		signal: controller.signal,
		write: (events: Record<string, unknown>[]) => {
			if (controller.signal.aborted || events.length === 0) {
				return;
			}
			const lines = events
				.map((event) => JSON.stringify(event) + "\n")
				.join("");
			if (output.writableLength + Buffer.byteLength(lines) > MAX_BUFFER_BYTES) {
				failure = new Error(
					"Live tail output cannot keep up. Narrow the filters and restart."
				);
				controller.abort();
				return;
			}
			pendingWrites++;
			try {
				output.write(lines, onWriteComplete);
			} catch (error) {
				onWriteComplete();
				onError(error);
			}
		},
		drain: async () => {
			draining = true;
			await new Promise<void>((resolve) => {
				const timer = setTimeout(() => {
					failure ??= new Error("Timed out writing live tail output.");
					resolve();
				}, shutdownTimeoutMs);
				finishDrain = () => {
					clearTimeout(timer);
					resolve();
				};
				setImmediate(cleanup);
			});
			if (failure) {
				throw failure;
			}
		},
	};
}
