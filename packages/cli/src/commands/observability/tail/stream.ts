import { setTimeout as delay } from "node:timers/promises";
import { tailOutput } from "./output.js";
import { tailRequests } from "./requests.js";
import { runSession } from "./session.js";
import type { Client } from "#api";
import type { TailRequest } from "./requests.js";
import type { Writable } from "node:stream";

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
	try {
		let url = await requests.prepare(lifetime);
		let attempt = 0;
		while (!lifetime.aborted) {
			const outcome = await runSession(url, {
				signal: lifetime,
				heartbeat: requests.heartbeat,
				heartbeatIntervalMs,
				connectTimeoutMs,
				onEvents: writer.write,
				notice,
				warn,
			});
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
