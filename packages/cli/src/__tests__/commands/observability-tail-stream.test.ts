import { once } from "node:events";
import { readFileSync } from "node:fs";
import { createServer as createHttpServer } from "node:http";
import { createServer } from "node:https";
import { connect } from "node:net";
import { Writable } from "node:stream";
import { getCACertificates, setDefaultCACertificates } from "node:tls";
import {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { WebSocketServer } from "ws";
import { ApiError, ApiTimeoutError, Client } from "../../api/index.js";
import { MAX_BUFFER_BYTES } from "../../commands/observability/tail/output.js";
import { runLiveTail } from "../../commands/observability/tail/stream.js";
import type { Server } from "node:http";
import type { Duplex } from "node:stream";

const tlsOptions = {
	cert: readFileSync(
		new URL("../fixtures/localhost-cert.pem", import.meta.url)
	),
	key: readFileSync(new URL("../fixtures/localhost-key.pem", import.meta.url)),
};
const defaultCertificates = getCACertificates("default");

beforeAll(() => {
	setDefaultCACertificates([...defaultCertificates, tlsOptions.cert]);
});

afterAll(() => {
	setDefaultCACertificates(defaultCertificates);
});

interface RequestRecord {
	path: string;
	method?: string;
	authorization?: string;
	body: unknown;
}

const cleanups: (() => Promise<void>)[] = [];

beforeEach(() => {
	for (const name of [
		"HTTPS_PROXY",
		"https_proxy",
		"HTTP_PROXY",
		"http_proxy",
		"NO_PROXY",
		"no_proxy",
	]) {
		vi.stubEnv(name, undefined);
	}
});

async function listen(server: Server) {
	const sockets = new Set<Duplex>();
	server.on("connection", (socket) => {
		sockets.add(socket);
		socket.on("close", () => sockets.delete(socket));
		socket.on("error", () => socket.destroy());
	});
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	if (address === null || typeof address === "string") {
		throw new Error("Expected a loopback server port");
	}
	cleanups.push(async () => {
		for (const socket of sockets) {
			socket.destroy();
		}
		server.close();
		await once(server, "close");
	});
	return { port: address.port, sockets };
}

function blockedOutput() {
	let complete: ((error?: Error | null) => void) | undefined;
	return {
		output: new Writable({
			write(_chunk, _encoding, callback) {
				complete = callback;
			},
		}),
		written: () =>
			vi.waitFor(() => {
				if (!complete) {
					throw new Error("Expected a pending output write");
				}
				return complete;
			}),
	};
}

function failingOutput(error: Error, delivery: "callback" | "throw") {
	return new Writable({
		write(_chunk, _encoding, callback) {
			if (delivery === "throw") {
				throw error;
			}
			callback(error);
		},
	});
}

async function proxyFixture({
	secure = false,
	status = 200,
	hold = false,
} = {}) {
	const requests: { path?: string; authorization?: string }[] = [];
	const server = secure ? createServer(tlsOptions) : createHttpServer();
	server.on("connect", (request, socket, head) => {
		socket.on("end", () => socket.end());
		requests.push({
			path: request.url,
			authorization: request.headers["proxy-authorization"],
		});
		if (hold) {
			socket.resume();
			return;
		}
		if (status !== 200) {
			socket.end(
				`HTTP/1.1 ${status} Proxy rejected\r\nContent-Length: 0\r\n\r\n`
			);
			return;
		}
		const target = new URL(`https://${request.url}`);
		const upstream = connect(Number(target.port), target.hostname, () => {
			socket.write("HTTP/1.1 200 Connection Established\r\n\r\n");
			upstream.write(head);
			socket.pipe(upstream).pipe(socket);
		});
		upstream.on("error", () => socket.destroy());
		socket.on("close", () => upstream.destroy());
	});
	const { port, sockets } = await listen(server);
	return {
		url: `${secure ? "https" : "http"}://proxy-user:proxy-secret@127.0.0.1:${port}`,
		requests,
		sockets,
	};
}

async function fixture() {
	const requests: RequestRecord[] = [];
	const websocket = new WebSocketServer({ noServer: true });
	const upgraded = websocket.clients;
	let prepareStatus = 200;
	let heartbeatStatus = 200;
	let heartbeatStatuses: number[] = [];
	let holdHeartbeat = false;
	let holdPrepareBody = false;
	let holdHeartbeatBody = false;
	let holdUpgrade = false;
	let upgradeStatus = 101;
	let upgradeAuthorization: string | undefined;
	let upgradeProxyAuthorization: string | undefined;
	let customPrepared: unknown;
	let prepareEnvelope: unknown;
	let origin = "";
	const server = createServer(tlsOptions, async (request, response) => {
		const chunks: Buffer[] = [];
		for await (const chunk of request) {
			chunks.push(Buffer.from(chunk));
		}
		requests.push({
			path: request.url ?? "",
			method: request.method,
			authorization: request.headers.authorization,
			body: JSON.parse(Buffer.concat(chunks).toString() || "null"),
		});
		response.setHeader("content-type", "application/json");
		if (request.url?.endsWith("/heartbeat")) {
			if (holdHeartbeat) {
				return;
			}
			const status = heartbeatStatuses.shift() ?? heartbeatStatus;
			response.statusCode = status;
			if (holdHeartbeatBody) {
				response.flushHeaders();
				return;
			}
			response.end(JSON.stringify({ success: status === 200, result: {} }));
			return;
		}
		response.statusCode = prepareStatus;
		response.setHeader("x-request-id", "fixture-request-id");
		if (holdPrepareBody) {
			response.flushHeaders();
			return;
		}
		response.end(
			JSON.stringify(
				prepareEnvelope ?? {
					success: prepareStatus === 200,
					...(prepareStatus === 200
						? {
								result: customPrepared ?? {
									wsUrl: `${origin.replace("https:", "wss:")}/connect?token=signed-secret&key=access-secret`,
								},
							}
						: {}),
				}
			)
		);
	});
	server.on("upgrade", (request, socket, head) => {
		upgradeAuthorization = request.headers.authorization;
		upgradeProxyAuthorization = request.headers["proxy-authorization"];
		if (holdUpgrade) {
			return;
		}
		if (upgradeStatus !== 101) {
			socket.end(
				`HTTP/1.1 ${upgradeStatus} Forbidden\r\nContent-Length: 0\r\n\r\n`
			);
			return;
		}
		websocket.handleUpgrade(request, socket, head, () => {});
	});
	const { port } = await listen(server);
	origin = `https://127.0.0.1:${port}`;
	cleanups.push(
		() => new Promise<void>((resolve) => websocket.close(() => resolve()))
	);
	const controller = new AbortController();
	let stdout = "";
	const output = new Writable({
		write(chunk, _encoding, callback) {
			stdout += String(chunk);
			callback();
		},
	});
	const notice = vi.fn();
	const warn = vi.fn();
	const client = new Client({
		baseUrl: origin,
		auth: async () => ({ headers: { authorization: "Bearer fixture-token" } }),
		maxRetries: 0,
	});
	return {
		origin,
		requests,
		get preparationCount() {
			return requests.filter((request) => !request.path.endsWith("/heartbeat"))
				.length;
		},
		get heartbeatCount() {
			return requests.filter((request) => request.path.endsWith("/heartbeat"))
				.length;
		},
		upgraded,
		controller,
		output,
		notice,
		warn,
		get stdout() {
			return stdout;
		},
		set prepareStatus(value: number) {
			prepareStatus = value;
		},
		set heartbeatStatus(value: number) {
			heartbeatStatus = value;
		},
		set heartbeatStatuses(value: number[]) {
			heartbeatStatuses = value;
		},
		set holdHeartbeat(value: boolean) {
			holdHeartbeat = value;
		},
		set holdPrepareBody(value: boolean) {
			holdPrepareBody = value;
		},
		set holdHeartbeatBody(value: boolean) {
			holdHeartbeatBody = value;
		},
		set holdUpgrade(value: boolean) {
			holdUpgrade = value;
		},
		set upgradeStatus(value: number) {
			upgradeStatus = value;
		},
		get upgradeAuthorization() {
			return upgradeAuthorization;
		},
		get upgradeProxyAuthorization() {
			return upgradeProxyAuthorization;
		},
		set prepared(value: unknown) {
			customPrepared = value;
		},
		set prepareEnvelope(value: unknown) {
			prepareEnvelope = value;
		},
		send(value: unknown) {
			for (const socket of upgraded) {
				socket.send(JSON.stringify(value));
			}
		},
		sendRaw(value: string, opcode = 1) {
			for (const socket of upgraded) {
				socket.send(value, { binary: opcode === 2 });
			}
		},
		close(code = 1000) {
			for (const socket of upgraded) {
				socket.close(code);
			}
		},
		connected: () =>
			vi.waitFor(() =>
				expect(
					requests.some((request) => request.path.endsWith("/heartbeat"))
				).toBe(true)
			),
		run(overrides: Partial<Parameters<typeof runLiveTail>[0]> = {}) {
			const running = runLiveTail({
				client,
				accountId: "fixture-account",
				body: { scriptId: "my-worker" },
				output,
				signal: controller.signal,
				notice,
				warn,
				heartbeatIntervalMs: 30,
				requestTimeoutMs: 1000,
				connectTimeoutMs: 1000,
				shutdownTimeoutMs: 100,
				reconnectBackoffMs: [],
				...overrides,
			});
			const settled = running.catch(() => undefined);
			cleanups.unshift(async () => {
				controller.abort();
				await settled;
			});
			return running;
		},
	};
}

afterEach(async () => {
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
	for (const cleanup of cleanups.splice(0)) {
		await cleanup();
	}
});

describe("Observability live tail stream with local HTTPS and WebSocket servers", () => {
	it("authenticates both HTTP operations, preserves scope and filters, and writes one JSON record per line", async () => {
		const server = await fixture();
		Object.assign(server.output, { isTTY: true });
		vi.stubEnv("FORCE_COLOR", "1");
		const body = {
			scriptId: "my-worker",
			filters: [
				{
					key: "$metadata.message",
					operation: "includes",
					type: "string",
					value: "hello",
				},
			],
			filterCombination: "or",
		};
		const running = server.run({ body });
		await server.connected();
		server.send({
			timestamp: "2026-11-10T00:00:00Z",
			source: { message: "hello\nworld" },
			redacted: "[REDACTED]",
		});
		server.send([{ id: "two" }, { id: "three" }]);
		await vi.waitFor(() =>
			expect(server.stdout.trim().split("\n")).toHaveLength(3)
		);
		server.controller.abort();
		await running;
		expect(server.requests[0]).toMatchObject({
			path: "/accounts/fixture-account/workers/observability/telemetry/live-tail",
			method: "POST",
			authorization: "Bearer fixture-token",
			body,
		});
		expect(server.requests[1]).toMatchObject({
			path: "/accounts/fixture-account/workers/observability/telemetry/live-tail/heartbeat",
			method: "POST",
			authorization: "Bearer fixture-token",
			body: { scriptId: "my-worker" },
		});
		expect(
			server.stdout
				.trim()
				.split("\n")
				.map((line) => JSON.parse(line))
		).toEqual([
			{
				timestamp: "2026-11-10T00:00:00Z",
				source: { message: "hello\nworld" },
				redacted: "[REDACTED]",
			},
			{ id: "two" },
			{ id: "three" },
		]);
		expect(server.stdout).not.toMatch(
			/signed-secret|access-secret|fixture-token/
		);
		expect(server.upgradeAuthorization).toBeUndefined();
	});

	it.each([
		{ secure: false, variable: "HTTPS_PROXY" },
		{ secure: true, variable: "https_proxy" },
	])(
		"streams through an authenticated proxy ($variable, TLS: $secure)",
		async ({ secure, variable }) => {
			const server = await fixture();
			const proxy = await proxyFixture({ secure });
			vi.stubEnv("HTTPS_PROXY", "http://127.0.0.1:1");
			vi.stubEnv(variable, proxy.url);
			const running = server.run();
			await server.connected();
			server.send({ message: "through the proxy" });
			await vi.waitFor(() =>
				expect(server.stdout).toContain("through the proxy")
			);
			server.controller.abort();
			await running;
			expect(proxy.requests).toEqual([
				{
					path: new URL(server.origin).host,
					authorization: `Basic ${Buffer.from("proxy-user:proxy-secret").toString("base64")}`,
				},
			]);
			expect(server.upgradeProxyAuthorization).toBeUndefined();
			expect(server.upgradeAuthorization).toBeUndefined();
			expect(JSON.parse(server.stdout)).toEqual({
				message: "through the proxy",
			});
			expect(
				[
					server.stdout,
					...server.notice.mock.calls.flat(),
					...server.warn.mock.calls.flat(),
				].join("\n")
			).not.toMatch(
				/proxy-user|proxy-secret|signed-secret|access-secret|fixture-token/
			);
		}
	);

	it("bypasses the streaming proxy for NO_PROXY hosts", async () => {
		const server = await fixture();
		const proxy = await proxyFixture({ status: 407 });
		vi.stubEnv("HTTPS_PROXY", proxy.url);
		vi.stubEnv("NO_PROXY", "127.0.0.1");
		const running = server.run();
		await server.connected();
		server.send({ message: "direct connection" });
		await vi.waitFor(() =>
			expect(server.stdout).toContain("direct connection")
		);
		server.controller.abort();
		await running;
		expect(proxy.requests).toHaveLength(0);
	});

	it("reports a rejected proxy connection without exposing credentials", async () => {
		const server = await fixture();
		const proxy = await proxyFixture({ status: 407 });
		vi.stubEnv("HTTPS_PROXY", proxy.url);
		await expect(server.run()).rejects.toThrow(
			"Live tail connection failed. Check connectivity."
		);
		expect(proxy.requests).toHaveLength(1);
		expect(server.upgraded.size).toBe(0);
		expect(server.notice.mock.calls.flat().join("\n")).not.toMatch(
			/proxy-user|proxy-secret/
		);
	});

	it.each(["timeout", "abort"])(
		"closes a stalled proxy connection on %s",
		async (reason) => {
			const server = await fixture();
			const proxy = await proxyFixture({ hold: true });
			vi.stubEnv("HTTPS_PROXY", proxy.url);
			const running = server.run({
				connectTimeoutMs: reason === "timeout" ? 100 : 1000,
			});
			const settled =
				reason === "timeout"
					? expect(running).rejects.toThrow(
							"Timed out connecting to live tail."
						)
					: expect(running).resolves.toBeUndefined();
			await vi.waitFor(() => expect(proxy.requests).toHaveLength(1));
			if (reason === "abort") {
				server.controller.abort();
			}
			await settled;
			await vi.waitFor(() => expect(proxy.sockets.size).toBe(0));
		}
	);

	it("shows the initial idle notice once across reconnects, including when only invalid or empty messages arrive", async () => {
		const server = await fixture();
		const running = server.run({ idleTimeoutMs: 150, reconnectBackoffMs: [1] });
		await server.connected();
		server.sendRaw("{malformed");
		server.send([]);
		await vi.waitFor(() =>
			expect(server.notice).toHaveBeenCalledWith(
				expect.stringContaining(
					"No matching events received in the last 0.15 seconds."
				)
			)
		);
		server.close(1011);
		await vi.waitFor(() => expect(server.preparationCount).toBe(2));
		await new Promise((resolve) => setTimeout(resolve, 200));
		server.controller.abort();
		await running;
		expect(
			server.notice.mock.calls.filter(([message]) =>
				message.includes("No matching events")
			)
		).toHaveLength(1);
		expect(server.stdout).toBe("");
	});

	it("cancels the idle notice when the first event arrives", async () => {
		const server = await fixture();
		const running = server.run({ idleTimeoutMs: 200 });
		await server.connected();
		server.send({ id: "first-event" });
		await vi.waitFor(() => expect(server.stdout).toContain("first-event"));
		await new Promise((resolve) => setTimeout(resolve, 250));
		server.controller.abort();
		await running;
		expect(server.notice).not.toHaveBeenCalledWith(
			expect.stringMatching(/No matching events/)
		);
	});

	it("never overlaps heartbeat requests and cancels an in-flight heartbeat on abort", async () => {
		const server = await fixture();
		server.holdHeartbeat = true;
		const running = server.run();
		await server.connected();
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(server.heartbeatCount).toBe(1);
		server.controller.abort();
		await running;
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it("tolerates two failed heartbeats and resets the failure count after a successful renewal", async () => {
		const server = await fixture();
		server.heartbeatStatuses = [503, 503, 200, 503, 503, 200];
		const running = server.run({ reconnectBackoffMs: [1] });
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(6)
		);
		server.send({ id: "still-connected" });
		await vi.waitFor(() => expect(server.stdout).toContain("still-connected"));
		server.controller.abort();
		await running;
		expect(server.preparationCount).toBe(1);
	});

	it("prepares a fresh connection after three consecutive heartbeat failures and preserves the filters", async () => {
		const server = await fixture();
		server.heartbeatStatuses = [503, 503, 503];
		const body = {
			filters: [
				{
					key: "$metadata.level",
					operation: "eq",
					type: "string",
					value: "error",
				},
			],
			filterCombination: "and",
		};
		const running = server.run({ body, reconnectBackoffMs: [1] });
		await vi.waitFor(() => {
			expect(server.preparationCount).toBe(2);
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(4);
		});
		server.send({ id: "recovered" });
		await vi.waitFor(() => expect(server.stdout).toContain("recovered"));
		server.controller.abort();
		await running;
		expect(
			server.requests
				.filter((request) => !request.path.endsWith("/heartbeat"))
				.map((request) => request.body)
		).toEqual([body, body]);
		for (const request of server.requests.filter((entry) =>
			entry.path.endsWith("/heartbeat")
		)) {
			expect(request.body).toEqual({});
		}
		expect(server.notice.mock.calls.flat().join("\n")).not.toMatch(
			/signed-secret|access-secret|fixture-token/
		);
	});

	it("exhausts the reconnect budget when heartbeats remain unhealthy across sessions", async () => {
		const server = await fixture();
		server.heartbeatStatus = 503;
		await expect(
			server.run({ reconnectBackoffMs: [1, 2] })
		).rejects.toMatchObject({ statusCode: 503 });
		expect(server.preparationCount).toBe(3);
		expect(server.heartbeatCount).toBe(9);
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it("reconnects after unexpected closure and renews the retry budget after a healthy session", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [1] });
		const waitForHealthySession = async (preparationCount: number) => {
			await vi.waitFor(() =>
				expect(server.preparationCount).toBe(preparationCount)
			);
			// Two new requests ensure a heartbeat has completed in this session.
			const heartbeats = server.heartbeatCount;
			await vi.waitFor(() => {
				expect(server.preparationCount).toBe(preparationCount);
				expect(server.heartbeatCount).toBeGreaterThanOrEqual(heartbeats + 2);
			});
		};
		await waitForHealthySession(1);
		server.close(1011);
		await waitForHealthySession(2);
		server.close(1011);
		await waitForHealthySession(3);
		server.send({ id: "third-session" });
		await vi.waitFor(() => expect(server.stdout).toContain("third-session"));
		server.controller.abort();
		await running;
		expect(
			server.notice.mock.calls.filter(([message]) =>
				message.includes("may be sampled")
			)
		).toHaveLength(1);
	});

	it("counts failed preparations against the reconnect budget", async () => {
		const server = await fixture();
		const result = server.run({ reconnectBackoffMs: [1, 2] }).then(
			() => undefined,
			(reason: unknown) => reason
		);
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(2)
		);
		server.prepareStatus = 503;
		server.close(1011);
		expect(await result).toMatchObject({ statusCode: 503 });
		expect(server.preparationCount).toBe(3);
	});

	it.each(["interrupt", "output close"])(
		"stops during reconnect backoff and cancels idle notices (%s)",
		async (reason) => {
			const server = await fixture();
			const running = server.run({
				idleTimeoutMs: 200,
				reconnectBackoffMs: [30_000],
			});
			await server.connected();
			server.close(1011);
			await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
			await new Promise((resolve) => setTimeout(resolve, 250));
			if (reason === "interrupt") {
				server.controller.abort();
			} else {
				server.output.destroy();
			}
			await running;
			expect(server.preparationCount).toBe(1);
			expect(server.notice).not.toHaveBeenCalledWith(
				expect.stringMatching(/No matching events/)
			);
		}
	);

	it("cancels a stalled preparation while reconnecting", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [1] });
		await server.connected();
		server.holdPrepareBody = true;
		server.close(1011);
		await vi.waitFor(() => expect(server.preparationCount).toBe(2));
		server.controller.abort();
		await running;
	});

	it.each(["preparation", "heartbeat"] as const)(
		"bounds a stalled %s response body after HTTP headers arrive",
		async (phase) => {
			const server = await fixture();
			server.holdPrepareBody = phase === "preparation";
			server.holdHeartbeatBody = phase === "heartbeat";
			let settled = false;
			const result = server.run().then(
				() => {
					settled = true;
					return undefined;
				},
				(reason: unknown) => {
					settled = true;
					return reason;
				}
			);
			try {
				await vi.waitFor(() => expect(settled).toBe(true), { timeout: 5000 });
				const error = await result;
				expect(error).toBeInstanceOf(ApiTimeoutError);
				expect(server.preparationCount).toBe(1);
				expect(server.heartbeatCount).toBe(phase === "heartbeat" ? 3 : 0);
				expect(String(error)).not.toMatch(
					/signed-secret|access-secret|fixture-token/
				);
				await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
			} finally {
				server.controller.abort();
				await result;
			}
		}
	);

	it.each([
		{ payload: "private binary content", opcode: 2, valid: [] },
		{ payload: "{private-secret", opcode: 1, valid: [] },
		{ payload: "null", opcode: 1, valid: [] },
		{ payload: '[{"valid":true},null]', opcode: 1, valid: [{ valid: true }] },
	])(
		"warns about invalid messages and keeps streaming ($payload)",
		async ({ payload, opcode, valid }) => {
			const server = await fixture();
			const running = server.run();
			await server.connected();
			server.send({ id: "before" });
			server.sendRaw(payload, opcode);
			server.send({ id: "after" });
			await vi.waitFor(() => expect(server.stdout).toContain("after"));
			server.controller.abort();
			await running;
			expect(server.warn).toHaveBeenCalled();
			expect(server.warn.mock.calls.flat().join("\n")).not.toContain("private");
			expect(
				server.stdout
					.trim()
					.split("\n")
					.map((line) => JSON.parse(line))
			).toEqual([{ id: "before" }, ...valid, { id: "after" }]);
			expect(server.preparationCount).toBe(1);
		}
	);

	it("reports a possible replacement and stops retrying after a normal remote closure", async () => {
		const server = await fixture();
		const result = server.run({ reconnectBackoffMs: [1] });
		const rejected = expect(result).rejects.toThrow(
			/another live tail session/i
		);
		await server.connected();
		server.close();
		await rejected;
		expect(server.preparationCount).toBe(1);
	});

	it("preserves structured API errors and request context", async () => {
		const server = await fixture();
		server.prepareStatus = 403;
		const errors = [{ code: 10000, message: "Account access denied" }];
		const messages = [{ message: "Contact the account administrator" }];
		server.prepareEnvelope = { success: false, errors, messages };
		const error = await server.run().catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			statusCode: 403,
			body: { success: false, errors, messages },
			requestId: "fixture-request-id",
			rawResponse: { url: expect.stringContaining("/telemetry/live-tail") },
		});
		expect(server.upgraded.size).toBe(0);
		expect(server.requests).toHaveLength(1);
	});

	it.each([
		"ws://example.invalid/?token=signed-secret",
		"malformed-url-with-signed-secret",
	])(
		"rejects invalid preparation URLs without exposing credentials (%s)",
		async (wsUrl) => {
			const server = await fixture();
			server.prepared = { wsUrl };
			const error = await server.run().then(
				() => undefined,
				(reason: unknown) => reason
			);
			expect(error).toBeInstanceOf(Error);
			expect(String(error)).not.toContain("signed-secret");
			expect(server.upgraded.size).toBe(0);
		}
	);

	it("bounds a stalled websocket handshake", async () => {
		const server = await fixture();
		server.holdUpgrade = true;
		await expect(server.run({ connectTimeoutMs: 30 })).rejects.toThrow(
			/Timed out connecting/
		);
	});

	it("sanitizes a rejected websocket handshake when retries are exhausted", async () => {
		const server = await fixture();
		server.upgradeStatus = 403;
		const error = await server.run().then(
			() => undefined,
			(reason: unknown) => reason
		);
		expect(String(error)).toMatch(/connection failed/i);
		expect(String(error)).not.toMatch(
			/signed-secret|access-secret|fixture-token/
		);
		expect(server.requests).toHaveLength(1);
	});

	it.each(["callback", "throw"] as const)(
		"stops cleanly when a pipe consumer closes stdout (%s)",
		async (failure) => {
			const server = await fixture();
			const output = failingOutput(
				Object.assign(new Error("fixture pipe closed"), { code: "EPIPE" }),
				failure
			);
			const running = server.run({ output });
			await server.connected();
			server.send({ id: "one" });
			await running;
			await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
		}
	);

	it.each([false, true])(
		"waits for pending output after abort and safely handles its completion (EPIPE: %s)",
		async (epipe) => {
			const server = await fixture();
			const { output, written } = blockedOutput();
			let settled = false;
			const running = server
				.run({ output, shutdownTimeoutMs: 500 })
				.then(() => {
					settled = true;
				});
			await server.connected();
			server.send({ id: "one" });
			const completeWrite = await written();
			server.controller.abort();
			await new Promise((resolve) => setImmediate(resolve));
			expect(settled).toBe(false);
			completeWrite(
				epipe
					? Object.assign(new Error("fixture closed pipe"), { code: "EPIPE" })
					: undefined
			);
			await running;
			expect(output.writableLength).toBe(0);
		}
	);

	it("bounds blocked output shutdown while retaining protection for a late EPIPE callback", async () => {
		const server = await fixture();
		const { output, written } = blockedOutput();
		let settled = false;
		const running = server.run({ output, shutdownTimeoutMs: 30 }).then(
			() => {
				settled = true;
				return undefined;
			},
			(reason: unknown) => {
				settled = true;
				return reason;
			}
		);
		await server.connected();
		server.send({ id: "one" });
		const completeWrite = await written();
		server.controller.abort();
		await vi.waitFor(() => expect(settled).toBe(true), { timeout: 500 });
		expect(String(await running)).toMatch(/Timed out writing live tail output/);
		completeWrite(
			Object.assign(new Error("fixture late closed pipe"), { code: "EPIPE" })
		);
		await new Promise((resolve) => setImmediate(resolve));
	});

	it.each(["callback", "throw"] as const)(
		"reports output failures and closes the socket (%s)",
		async (failure) => {
			const server = await fixture();
			const output = failingOutput(
				new Error("private filesystem path"),
				failure
			);
			const result = server.run({ output }).catch((reason: unknown) => reason);
			await server.connected();
			server.send({ id: "one" });
			const error = await result;
			expect(String(error)).toMatch(/Could not write.*stdout/);
			expect(String(error)).not.toContain("private filesystem path");
			await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
		}
	);

	it("stops when a slow consumer would cause unbounded output buffering", async () => {
		const server = await fixture();
		const output = new Writable({
			highWaterMark: 1,
			write() {},
		});
		const result = server.run({ output }).then(
			() => undefined,
			(reason: unknown) => reason
		);
		await server.connected();
		const event = { message: "x".repeat(60_000) };
		for (
			let index = 0;
			index <= Math.ceil(MAX_BUFFER_BYTES / 60_000);
			index++
		) {
			server.send(event);
		}
		expect(String(await result)).toMatch(/output cannot keep up/i);
		expect(output.writableLength).toBeLessThanOrEqual(MAX_BUFFER_BYTES);
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});
});
