import { Agent } from "node:https";
import { addAbortSignal } from "node:stream";
import { setTimeout as delay } from "node:timers/promises";
import WebSocket from "ws";
import { decodeEvents, MAX_BUFFER_BYTES, tailOutput } from "./output.js";
import type { Writable } from "node:stream";
import { ApiTimeoutError, type Client, type Operation } from "#api";
import { prepareLiveTail, sendLiveTailHeartbeat } from "#lib/api-operations.js";

export interface TailRequest {
	scriptId?: string;
	filters?: Record<string, unknown>[];
	filterCombination?: string;
}

export interface LiveTailOptions {
	client: Client;
	accountId: string;
	body: TailRequest;
	output?: Writable;
	signal?: AbortSignal;
	notice?: (message: string) => void;
	warn?: (message: string) => void;
	heartbeatIntervalMs?: number;
	requestTimeoutMs?: number;
	connectTimeoutMs?: number;
	shutdownTimeoutMs?: number;
	idleTimeoutMs?: number;
	reconnectBackoffMs?: readonly number[];
}

export async function runLiveTail({
	client,
	accountId,
	body,
	output = process.stdout,
	signal,
	notice = () => {},
	warn = () => {},
	heartbeatIntervalMs = 30_000,
	requestTimeoutMs = 10_000,
	connectTimeoutMs = 8_000,
	shutdownTimeoutMs = 1_000,
	idleTimeoutMs = 30_000,
	reconnectBackoffMs = [1_000, 2_000, 4_000, 8_000, 16_000],
}: LiveTailOptions): Promise<void> {
	if (signal?.aborted || output.destroyed) {
		return;
	}
	const writer = tailOutput(output, shutdownTimeoutMs);
	const controller = new AbortController();
	const lifetime = AbortSignal.any([
		controller.signal,
		writer.signal,
		...(signal ? [signal] : []),
	]);
	const requests = tailRequests(client, accountId, body, requestTimeoutMs);
	const notices = tailNotices(notice, idleTimeoutMs);
	try {
		let url = await requests.prepare(lifetime);
		let attempt = 0;
		while (!lifetime.aborted) {
			const outcome = await runSession(url, {
				signal: lifetime,
				heartbeat: requests.heartbeat,
				heartbeatIntervalMs,
				connectTimeoutMs,
				onConnect: notices.connected,
				onEvents: (events) => {
					if (events.length > 0) {
						notices.received();
					}
					writer.write(events);
				},
				warn,
			}).finally(notices.disconnected);
			if (outcome.kind === "stopped" || lifetime.aborted) {
				return;
			}
			if (outcome.wasHealthy) {
				attempt = 0;
			}
			let lastError = outcome.error;
			while (!lifetime.aborted) {
				const delayMs = reconnectBackoffMs[attempt];
				if (delayMs === undefined) {
					if (attempt > 0) {
						notice(
							`Unable to reconnect to live tail after ${attempt} attempts.`
						);
					}
					throw lastError;
				}
				attempt++;
				notice(
					`Reconnecting to live tail (attempt ${attempt} of ${reconnectBackoffMs.length}) in ${delayMs / 1000}s...`
				);
				await delay(delayMs, undefined, { signal: lifetime });
				try {
					url = await requests.prepare(lifetime);
					break;
				} catch (error) {
					lastError = error;
				}
			}
		}
	} catch (error) {
		if (!lifetime.aborted) {
			throw error;
		}
	} finally {
		controller.abort();
		await writer.drain();
	}
}

function tailNotices(notice: (message: string) => void, idleTimeoutMs: number) {
	let firstConnection = true;
	let idleNoticePending = true;
	let idleTimer: ReturnType<typeof setTimeout> | undefined;
	const clearIdleTimer = () => clearTimeout(idleTimer);
	return {
		connected: () => {
			notice("Connected. Press Ctrl-C to stop.");
			if (firstConnection) {
				firstConnection = false;
				notice(
					"Live tail follows your observability settings and may be sampled."
				);
			}
			if (idleNoticePending) {
				idleTimer = setTimeout(() => {
					idleNoticePending = false;
					notice(
						`No matching events received in the last ${idleTimeoutMs / 1000} seconds. Check your filters and observability settings if activity was expected.`
					);
				}, idleTimeoutMs);
			}
		},
		received: () => {
			idleNoticePending = false;
			clearIdleTimer();
		},
		disconnected: clearIdleTimer,
	};
}

type SessionOutcome =
	| { kind: "stopped" }
	| { kind: "lost"; error: unknown; wasHealthy: boolean };

interface SessionOptions {
	signal: AbortSignal;
	heartbeat: (signal: AbortSignal) => Promise<unknown>;
	heartbeatIntervalMs: number;
	connectTimeoutMs: number;
	onEvents: (events: Record<string, unknown>[]) => void;
	onConnect: () => void;
	warn: (message: string) => void;
}

async function runSession(
	url: string,
	{
		signal,
		heartbeat,
		heartbeatIntervalMs,
		connectTimeoutMs,
		onEvents,
		onConnect,
		warn,
	}: SessionOptions
): Promise<SessionOutcome> {
	if (signal.aborted) {
		return { kind: "stopped" };
	}
	const controller = new AbortController();
	const sessionSignal = AbortSignal.any([signal, controller.signal]);
	let socket: WebSocket | undefined;
	let agent: Agent | undefined;
	let renewal: Promise<void> | undefined;
	let connectTimer: ReturnType<typeof setTimeout> | undefined;
	try {
		return await new Promise<SessionOutcome>((resolve, reject) => {
			let wasHealthy = false;
			const stop = () => resolve({ kind: "stopped" });
			const lose = (error: unknown) =>
				resolve({ kind: "lost", error, wasHealthy });
			sessionSignal.addEventListener("abort", stop, { once: true });
			try {
				agent = tailAgent(sessionSignal);
				socket = new WebSocket(url, {
					agent,
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
				onConnect();
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
				if (sessionSignal.aborted) {
					stop();
				} else if (event.code === 1000) {
					reject(
						new Error(
							"Live tail ended. Another live tail session may have replaced this one."
						)
					);
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
		agent?.destroy();
		await renewal;
	}
}

function tailAgent(signal: AbortSignal): Agent {
	const agent = new Agent({ proxyEnv: process.env });
	const connect = agent.createConnection.bind(agent);
	agent.createConnection = (...args) => {
		const socket = connect(...args);
		// Pending proxy tunnels are not yet tracked by Agent.destroy().
		return socket ? addAbortSignal(signal, socket) : socket;
	};
	return agent;
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

export function tailRequests(
	client: Client,
	accountId: string,
	body: TailRequest,
	timeoutMs: number
) {
	const send = async (
		operation: Operation,
		requestBody: TailRequest,
		signal: AbortSignal
	) => {
		const deadline = new AbortController();
		const timer = setTimeout(() => deadline.abort(), timeoutMs);
		try {
			// Cover body consumption as well as the client's fetch deadline.
			return await client.send(
				operation,
				{ account_id: accountId, body: requestBody },
				{
					abortSignal: AbortSignal.any([signal, deadline.signal]),
					timeoutInSeconds: timeoutMs / 1000,
					maxRetries: 0,
				}
			);
		} catch (error) {
			if (deadline.signal.aborted && !signal.aborted) {
				throw new ApiTimeoutError(
					`Timeout exceeded when calling ${operation.method} ${operation.path({ account_id: accountId })}.`
				);
			}
			throw error;
		} finally {
			clearTimeout(timer);
		}
	};
	return {
		prepare: async (signal: AbortSignal) =>
			connectionUrl(await send(prepareLiveTail, body, signal)),
		heartbeat: (signal: AbortSignal) =>
			send(
				sendLiveTailHeartbeat,
				body.scriptId === undefined ? {} : { scriptId: body.scriptId },
				signal
			),
	};
}

function connectionUrl(result: unknown): string {
	try {
		if (
			!result ||
			typeof result !== "object" ||
			!("wsUrl" in result) ||
			typeof result.wsUrl !== "string"
		) {
			throw new Error();
		}
		const url = new URL(result.wsUrl);
		if (url.protocol !== "wss:") {
			throw new Error();
		}
		return url.toString();
	} catch {
		// The URL is a bearer credential, including when validation fails.
		throw new Error(
			"Could not establish a live tail connection. Please try restarting cf observability tail."
		);
	}
}
