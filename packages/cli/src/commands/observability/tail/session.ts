import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";
import { decodeEvents, MAX_BUFFER_BYTES } from "./events.js";

type SessionOutcome =
	| { kind: "stopped" }
	| { kind: "lost"; error: unknown; wasHealthy: boolean };

interface SessionOptions {
	signal: AbortSignal;
	heartbeat: (signal: AbortSignal) => Promise<unknown>;
	heartbeatIntervalMs: number;
	connectTimeoutMs: number;
	onEvents: (events: Record<string, unknown>[]) => void;
	notice: (message: string) => void;
	warn: (message: string) => void;
}

async function renewSession(
	heartbeat: SessionOptions["heartbeat"],
	intervalMs: number,
	signal: AbortSignal,
	onHealthy: () => void
): Promise<void> {
	let failures = 0;
	while (!signal.aborted) {
		try {
			await heartbeat(signal);
			failures = 0;
			onHealthy();
		} catch (error) {
			if (signal.aborted) {
				return;
			}
			if (++failures === 3) {
				throw error;
			}
		}
		await delay(intervalMs, undefined, { signal });
	}
}

export async function runSession(
	url: string,
	{
		signal,
		heartbeat,
		heartbeatIntervalMs,
		connectTimeoutMs,
		onEvents,
		notice,
		warn,
	}: SessionOptions
): Promise<SessionOutcome> {
	if (signal.aborted) {
		return { kind: "stopped" };
	}
	const controller = new AbortController();
	const sessionSignal = AbortSignal.any([signal, controller.signal]);
	let socket: WebSocket | undefined;
	let renewal: Promise<void> | undefined;
	let connectTimer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await new Promise<SessionOutcome>((resolve) => {
			let wasHealthy = false;
			const stop = () => resolve({ kind: "stopped" });
			const lose = (error: unknown) =>
				resolve({ kind: "lost", error, wasHealthy });
			sessionSignal.addEventListener("abort", stop, { once: true });
			try {
				// The signed WebSocket URL carries its own credentials.
				socket = new WebSocket(url, {
					maxPayload: MAX_BUFFER_BYTES,
					perMessageDeflate: false,
				});
			} catch {
				lose(new Error("Could not open the live tail connection."));
				return;
			}
			connectTimer = setTimeout(
				() => lose(new Error("Timed out connecting to live tail.")),
				connectTimeoutMs
			);
			socket.addEventListener("open", () => {
				clearTimeout(connectTimer);
				if (sessionSignal.aborted) {
					return;
				}
				notice("Connected. Press Ctrl-C to stop.");
				renewal = renewSession(
					heartbeat,
					heartbeatIntervalMs,
					sessionSignal,
					() => {
						wasHealthy = true;
					}
				).catch((error: unknown) => {
					if (!sessionSignal.aborted) {
						lose(error);
					}
				});
			});
			socket.addEventListener("message", (event) => {
				if (sessionSignal.aborted) {
					return;
				}
				const { events, warning } = decodeEvents(event.data);
				if (warning) {
					warn(warning);
				}
				onEvents(events);
			});
			socket.addEventListener("error", () =>
				lose(new Error("Live tail connection failed. Check connectivity."))
			);
			socket.addEventListener("close", (event) => {
				if (event.code === 1000) {
					stop();
				} else {
					lose(new Error(`Live tail disconnected (code ${event.code}).`));
				}
			});
		});
	} finally {
		clearTimeout(connectTimer);
		controller.abort();
		if (socket && socket.readyState !== WebSocket.CLOSED) {
			socket.terminate();
		}
		await renewal;
	}
}
