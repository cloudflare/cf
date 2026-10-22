import { getDefaultHeaders } from "../../lib/request-headers.js";

// The method of speed.cloudflare.com's `@cloudflare/speedtest`, without its
// WebRTC packet-loss test, which Node cannot run. The library itself expects
// a browser: it reads Resource Timing entries and `window.location`.
const SPEED_ORIGIN = "https://speed.cloudflare.com";
const REQUEST_TIMEOUT_MS = 60_000;
const LATENCY_SAMPLES = 20;
const LATENCY_PERCENTILE = 0.5;
const BANDWIDTH_PERCENTILE = 0.9;
/** A direction stops at the first set whose every request took longer. */
const FINISH_REQUEST_DURATION_MS = 1000;
/** Shorter requests are too quick to time reliably. */
const MIN_REQUEST_DURATION_MS = 10;
/** The library's allowance for HTTP framing on top of the payload. */
const OVERHEAD = 1.005;

export type Direction = "download" | "upload";

export interface BandwidthSet {
	bytes: number;
	count: number;
}

const BANDWIDTH_SETS: Record<Direction, readonly BandwidthSet[]> = {
	download: [
		{ bytes: 1e5, count: 10 },
		{ bytes: 1e6, count: 8 },
		{ bytes: 1e7, count: 6 },
		{ bytes: 25e6, count: 4 },
		{ bytes: 1e8, count: 3 },
		{ bytes: 25e7, count: 2 },
	],
	upload: [
		{ bytes: 1e5, count: 8 },
		{ bytes: 1e6, count: 6 },
		{ bytes: 1e7, count: 4 },
		{ bytes: 25e6, count: 4 },
		{ bytes: 5e7, count: 3 },
	],
};

export interface Latency {
	pings: number[];
	dataCenter: string | undefined;
}

export interface BandwidthSample {
	durationMs: number;
	bps: number;
}

export interface SpeedTestResult {
	downloadMbps: number;
	uploadMbps: number;
	latencyMs: number;
	jitterMs: number | null;
	dataCenter: string | null;
}

interface Timing {
	/** From sending the request to receiving the response headers. */
	ttfb: number;
	/** From receiving the response headers to the end of the body. */
	payload: number;
	bytes: number;
	serverTime: number;
	dataCenter: string | undefined;
}

/** Linearly interpolated, as the library computes it. */
export function percentile(values: readonly number[], p: number): number {
	if (values.length === 0) {
		return 0;
	}
	const sorted = values.toSorted((a, b) => a - b);
	const index = (sorted.length - 1) * p;
	const lower = sorted[Math.floor(index)] ?? 0;
	const upper = sorted[Math.ceil(index)] ?? lower;
	return lower + (upper - lower) * (index % 1);
}

/** The mean difference between consecutive pings. */
export function jitter(pings: readonly number[]): number | null {
	if (pings.length < 2) {
		return null;
	}
	let sum = 0;
	for (let i = 1; i < pings.length; i++) {
		sum += Math.abs((pings[i] ?? 0) - (pings[i - 1] ?? 0));
	}
	return sum / (pings.length - 1);
}

/**
 * The server's processing time in milliseconds, which is not network time.
 * Prefers the total request duration, then the sum of the speed Worker's
 * timings.
 */
export function parseServerTime(header: string | null): number {
	if (!header) {
		return 0;
	}
	const total = /(?:^|,\s*)cfReq(?:uest)?Dur(?:ation)?;\s*dur=([0-9.]+)/i.exec(
		header
	);
	if (total) {
		return Number(total[1]);
	}
	let sum = 0;
	for (const match of header.matchAll(
		/(?:^|,\s*)cfSpeed[a-zA-Z]*;\s*dur=([0-9.]+)/gi
	)) {
		sum += Number(match[1]);
	}
	return sum;
}

/**
 * The IATA code after the ray ID in a `cf-ray` header, such as `SFO` in
 * `8f2b4c1d2e3f4a5b-SFO`. Some networks append a suffix: `…-SFO-DOG`.
 */
export function parseDataCenter(cfRay: string | null): string | undefined {
	return cfRay?.match(/^[0-9a-f]+-([A-Z]{3})\b/i)?.[1]?.toUpperCase();
}

function connectionError(signal: AbortSignal, cause: unknown): Error {
	return new Error(
		signal.aborted
			? "The speed test timed out. Check your connection and try again."
			: "Unable to reach speed.cloudflare.com. Check your connection and try again.",
		{ cause }
	);
}

async function countBytes(body: ReadableStream<Uint8Array> | null) {
	const reader = body?.getReader();
	let bytes = 0;
	for (;;) {
		const chunk = await reader?.read();
		if (!chunk || chunk.done) {
			return bytes;
		}
		bytes += chunk.value.byteLength;
	}
}

async function timeRequest(
	path: string,
	init: RequestInit = {}
): Promise<Timing> {
	const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
	const start = performance.now();
	let response: Response;
	try {
		response = await fetch(`${SPEED_ORIGIN}${path}`, {
			...init,
			headers: getDefaultHeaders(),
			signal,
		});
	} catch (cause) {
		throw connectionError(signal, cause);
	}
	const headersAt = performance.now();
	if (!response.ok) {
		await response.body?.cancel();
		throw new Error(
			response.status === 429
				? "speed.cloudflare.com is rate limiting requests. Try again later."
				: `Speed test request failed (HTTP ${response.status}).`
		);
	}
	let bytes: number;
	try {
		bytes = await countBytes(response.body);
	} catch (cause) {
		throw connectionError(signal, cause);
	}
	return {
		ttfb: headersAt - start,
		payload: performance.now() - headersAt,
		bytes,
		serverTime: parseServerTime(response.headers.get("server-timing")),
		dataCenter: parseDataCenter(response.headers.get("cf-ray")),
	};
}

function ping(timing: Timing): number {
	return Math.max(0, timing.ttfb - timing.serverTime);
}

export async function measureLatency(
	onPing: (pings: readonly number[]) => void = () => {}
): Promise<Latency> {
	// The first request also opens the connection, so it is not a sample.
	const { dataCenter } = await timeRequest("/__down?bytes=0");
	const pings: number[] = [];
	for (let i = 0; i < LATENCY_SAMPLES; i++) {
		pings.push(ping(await timeRequest("/__down?bytes=0")));
		onPing(pings);
	}
	return { pings, dataCenter };
}

async function measureRequest(
	direction: Direction,
	bytes: number,
	body: Uint8Array<ArrayBuffer> | undefined
): Promise<BandwidthSample> {
	if (direction === "download") {
		const timing = await timeRequest(`/__down?bytes=${bytes}`);
		const durationMs = ping(timing) + timing.payload;
		return {
			durationMs,
			bps: (8 * OVERHEAD * timing.bytes) / (durationMs / 1000),
		};
	}
	// The upload response arrives once the server has read the whole body.
	const { ttfb: durationMs } = await timeRequest("/__up", {
		method: "POST",
		body,
	});
	return { durationMs, bps: (8 * OVERHEAD * bytes) / (durationMs / 1000) };
}

/**
 * Times sets of requests of growing size until one set takes long enough to
 * saturate the connection.
 */
export async function measureBandwidth(
	direction: Direction,
	onSample: (samples: readonly BandwidthSample[]) => void = () => {}
): Promise<BandwidthSample[]> {
	const samples: BandwidthSample[] = [];
	for (const { bytes, count } of BANDWIDTH_SETS[direction]) {
		const body = direction === "upload" ? new Uint8Array(bytes) : undefined;
		let fastest = Infinity;
		for (let i = 0; i < count; i++) {
			const sample = await measureRequest(direction, bytes, body);
			samples.push(sample);
			onSample(samples);
			fastest = Math.min(fastest, sample.durationMs);
		}
		if (fastest > FINISH_REQUEST_DURATION_MS) {
			break;
		}
	}
	return samples;
}

export function latencyMs(pings: readonly number[]): number {
	return percentile(pings, LATENCY_PERCENTILE);
}

export function bandwidthBps(samples: readonly BandwidthSample[]): number {
	return percentile(
		samples
			.filter(
				({ durationMs, bps }) =>
					durationMs >= MIN_REQUEST_DURATION_MS &&
					Number.isFinite(bps) &&
					bps > 0
			)
			.map(({ bps }) => bps),
		BANDWIDTH_PERCENTILE
	);
}

function round(value: number): number {
	return Math.round(value * 100) / 100;
}

export function summarize(
	latency: Latency,
	download: readonly BandwidthSample[],
	upload: readonly BandwidthSample[]
): SpeedTestResult {
	const jitterMs = jitter(latency.pings);
	return {
		downloadMbps: round(bandwidthBps(download) / 1e6),
		uploadMbps: round(bandwidthBps(upload) / 1e6),
		latencyMs: round(latencyMs(latency.pings)),
		jitterMs: jitterMs === null ? null : round(jitterMs),
		dataCenter: latency.dataCenter ?? null,
	};
}
