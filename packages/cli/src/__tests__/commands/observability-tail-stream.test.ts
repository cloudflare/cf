import { createHash } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { Writable } from "node:stream";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import * as wsModule from "ws";
import { ApiError, ApiTimeoutError, Client } from "../../api/index.js";
import { runLiveTail } from "../../commands/observability/tail/stream.js";
import type { ServerResponse } from "node:http";
import type { Duplex } from "node:stream";

vi.mock("ws", { spy: true });

function frame(value: string, opcode = 1): Buffer {
	const payload = Buffer.from(value);
	if (payload.length < 126) {
		return Buffer.concat([
			Buffer.from([0x80 | opcode, payload.length]),
			payload,
		]);
	}
	const header = Buffer.alloc(4);
	header[0] = 0x80 | opcode;
	header[1] = 126;
	header.writeUInt16BE(payload.length, 2);
	return Buffer.concat([header, payload]);
}

interface RequestRecord {
	path: string;
	method?: string;
	authorization?: string;
	body: unknown;
}

const cleanups: (() => Promise<void>)[] = [];

async function fixture() {
	const requests: RequestRecord[] = [];
	const sockets = new Set<Duplex>();
	const upgraded = new Set<Duplex>();
	let prepareStatus = 200;
	let heartbeatStatus = 200;
	let heartbeatStatuses: number[] = [];
	let holdHeartbeat = false;
	let holdPrepareBody = false;
	let holdHeartbeatBody = false;
	let holdUpgrade = false;
	let holdClose = false;
	let upgradeStatus = 101;
	let upgradeAuthorization: string | undefined;
	let heartbeatResponse: ServerResponse | undefined;
	let customPrepared: unknown;
	let prepareEnvelope: unknown;
	let origin = "";
	const server = createServer(async (request, response) => {
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
			heartbeatResponse = response;
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
					result: customPrepared ?? {
						wsUrl: `${origin.replace("http:", "ws:")}/connect?token=signed-secret&key=access-secret`,
					},
				}
			)
		);
	});
	server.on("connection", (socket) => {
		sockets.add(socket);
		socket.on("close", () => sockets.delete(socket));
		socket.on("error", (error: NodeJS.ErrnoException) => {
			expect(error.code).toBe("ECONNRESET");
		});
	});
	server.on("upgrade", (request, socket) => {
		upgradeAuthorization = request.headers.authorization;
		if (holdUpgrade) {
			return;
		}
		if (upgradeStatus !== 101) {
			socket.end(
				`HTTP/1.1 ${upgradeStatus} Forbidden\r\nContent-Length: 0\r\n\r\n`
			);
			return;
		}
		const accept = createHash("sha1")
			.update(
				`${request.headers["sec-websocket-key"]}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`
			)
			.digest("base64");
		socket.write(
			`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`
		);
		upgraded.add(socket);
		socket.on("end", () => socket.end());
		socket.on("data", (data: Buffer) => {
			if ((data[0] ?? 0) % 16 === 8 && !socket.writableEnded && !holdClose) {
				socket.end(Buffer.from([0x88, 0]));
			}
		});
		socket.on("close", () => upgraded.delete(socket));
	});
	server.listen(0, "127.0.0.1");
	await once(server, "listening");
	const address = server.address();
	if (address === null || typeof address === "string") {
		throw new Error("Expected loopback fixture port");
	}
	origin = `http://127.0.0.1:${address.port}`;
	cleanups.push(async () => {
		for (const socket of sockets) {
			socket.destroy();
		}
		server.close();
		await once(server, "close");
	});
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
		requests,
		get preparationCount() {
			return requests.filter((request) => !request.path.endsWith("/heartbeat"))
				.length;
		},
		get heartbeatCount() {
			return requests.filter((request) => request.path.endsWith("/heartbeat"))
				.length;
		},
		sockets,
		upgraded,
		controller,
		output,
		notice,
		warn,
		client,
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
		set holdClose(value: boolean) {
			holdClose = value;
		},
		set upgradeStatus(value: number) {
			upgradeStatus = value;
		},
		get upgradeAuthorization() {
			return upgradeAuthorization;
		},
		set prepared(value: unknown) {
			customPrepared = value;
		},
		set prepareEnvelope(value: unknown) {
			prepareEnvelope = value;
		},
		releaseHeartbeat() {
			heartbeatResponse?.end(JSON.stringify({ success: true, result: {} }));
		},
		send(value: unknown) {
			for (const socket of upgraded) {
				socket.write(frame(JSON.stringify(value)));
			}
		},
		sendRaw(value: string, opcode = 1) {
			for (const socket of upgraded) {
				socket.write(frame(value, opcode));
			}
		},
		close(code = 1000) {
			const message = Buffer.from([0x88, 2, 0, 0]);
			message.writeUInt16BE(code, 2);
			for (const socket of upgraded) {
				socket.end(message);
			}
		},
		run(overrides: Partial<Parameters<typeof runLiveTail>[0]> = {}) {
			return runLiveTail({
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
		},
	};
}

afterEach(async () => {
	vi.restoreAllMocks();
	for (const cleanup of cleanups.splice(0)) {
		await cleanup();
	}
});

describe("Observability live tail stream with local HTTP and WebSocket servers", () => {
	it("authenticates both HTTP operations, preserves scope and filters, and writes one JSON record per line", async () => {
		const server = await fixture();
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
		await vi.waitFor(() =>
			expect(
				server.requests.filter((request) => request.path.endsWith("/heartbeat"))
					.length
			).toBeGreaterThanOrEqual(1)
		);
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

	it.each([false, true])(
		"writes plain newline-delimited JSON with FORCE_COLOR (terminal: %s)",
		async (terminal) => {
			const server = await fixture();
			Object.assign(server.output, { isTTY: terminal });
			vi.stubEnv("FORCE_COLOR", "1");
			const running = server.run();
			try {
				await vi.waitFor(() =>
					expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
				);
				server.send({ message: "hello\nworld", count: 1 });
				await vi.waitFor(() => expect(server.stdout).toContain("hello"));
				expect(server.stdout).toBe('{"message":"hello\\nworld","count":1}\n');
			} finally {
				server.controller.abort();
				await running;
				vi.unstubAllEnvs();
			}
		}
	);

	it("keeps account-wide scope on every heartbeat", async () => {
		const server = await fixture();
		const running = server.run({ body: { filterCombination: "and" } });
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(3)
		);
		server.controller.abort();
		await running;
		for (const request of server.requests.slice(1)) {
			expect(request.body).toEqual({});
		}
	});

	it("never overlaps heartbeat requests and cancels an in-flight heartbeat on abort", async () => {
		const server = await fixture();
		server.holdHeartbeat = true;
		const running = server.run();
		await vi.waitFor(() => expect(server.requests).toHaveLength(2));
		await new Promise((resolve) => setTimeout(resolve, 100));
		expect(server.requests).toHaveLength(2);
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
		expect(server.notice.mock.calls.flat().join("\n")).not.toContain(
			"Reconnecting"
		);
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
		expect(server.notice.mock.calls.flat().join("\n")).toContain(
			"Reconnecting"
		);
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
		expect(server.notice.mock.calls.flat().join("\n")).toContain(
			"after 2 attempts"
		);
		expect(server.preparationCount).toBe(3);
		expect(server.heartbeatCount).toBe(9);
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it("reconnects after unexpected closure and renews the retry budget after a healthy session", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [1] });
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(2)
		);
		server.close(1011);
		await vi.waitFor(() => {
			expect(server.preparationCount).toBe(2);
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(4);
		});
		server.close(1011);
		await vi.waitFor(() => {
			expect(server.preparationCount).toBe(3);
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(6);
		});
		server.send({ id: "third-session" });
		await vi.waitFor(() => expect(server.stdout).toContain("third-session"));
		server.controller.abort();
		await running;
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
		expect(server.notice.mock.calls.flat().join("\n")).toContain(
			"after 2 attempts"
		);
		expect(server.preparationCount).toBe(3);
	});

	it("stops promptly during reconnect backoff", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [30_000] });
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
		);
		server.close(1011);
		await vi.waitFor(() =>
			expect(server.notice.mock.calls.flat().join("\n")).toContain(
				"Reconnecting"
			)
		);
		server.controller.abort();
		await running;
		expect(server.preparationCount).toBe(1);
	});

	it("stops reconnecting when the output consumer closes during backoff", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [30_000] });
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
		);
		server.close(1011);
		await vi.waitFor(() =>
			expect(server.notice.mock.calls.flat().join("\n")).toContain(
				"Reconnecting"
			)
		);
		server.output.destroy();
		await running;
		expect(server.preparationCount).toBe(1);
	});

	it("cancels a stalled preparation while reconnecting", async () => {
		const server = await fixture();
		const running = server.run({ reconnectBackoffMs: [1] });
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
		);
		server.holdPrepareBody = true;
		server.close(1011);
		await vi.waitFor(() => expect(server.preparationCount).toBe(2));
		server.controller.abort();
		await running;
	});

	it.each([401, 403])(
		"preserves API error details for persistent heartbeat authorization failure %s",
		async (status) => {
			const server = await fixture();
			server.heartbeatStatus = status;
			const error = await server.run().then(
				() => undefined,
				(reason: unknown) => reason
			);
			expect(error).toBeInstanceOf(ApiError);
			expect(error).toMatchObject({
				statusCode: status,
				rawResponse: { status },
			});
			expect(String(error)).not.toMatch(
				/signed-secret|access-secret|fixture-token/
			);
			await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
		}
	);

	it("warns about binary messages and continues receiving events", async () => {
		const server = await fixture();
		const running = server.run();
		await vi.waitFor(() =>
			expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
		);
		server.sendRaw("private binary content", 2);
		server.send({ id: "after-binary" });
		await vi.waitFor(() => expect(server.stdout).toContain("after-binary"));
		expect(server.warn).toHaveBeenCalledWith(
			"Skipped an unsupported live tail message."
		);
		expect(server.warn.mock.calls.flat().join("\n")).not.toContain(
			"private binary content"
		);
		server.controller.abort();
		await running;
	});

	it("bounds a stalled heartbeat and closes the socket", async () => {
		const server = await fixture();
		server.holdHeartbeat = true;
		await expect(server.run()).rejects.toBeInstanceOf(ApiTimeoutError);
		expect(server.heartbeatCount).toBe(3);
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
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
				expect(error).toBeInstanceOf(Error);
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

	it.each(["{private-secret", "null", "42", '[{"valid":true},null]'])(
		"warns about invalid event payload %s and keeps streaming",
		async (payload) => {
			const server = await fixture();
			const running = server.run();
			await vi.waitFor(() =>
				expect(server.heartbeatCount).toBeGreaterThanOrEqual(1)
			);
			server.send({ id: "before" });
			server.sendRaw(payload);
			server.send({ id: "after" });
			await vi.waitFor(() => expect(server.stdout).toContain("after"));
			expect(server.warn).toHaveBeenCalledOnce();
			expect(server.warn.mock.calls.flat().join("\n")).not.toContain(
				"private-secret"
			);
			const events = server.stdout
				.trim()
				.split("\n")
				.map((line) => JSON.parse(line));
			expect(events).toEqual(
				payload.startsWith("[")
					? [{ id: "before" }, { valid: true }, { id: "after" }]
					: [{ id: "before" }, { id: "after" }]
			);
			expect(server.preparationCount).toBe(1);
			server.controller.abort();
			await running;
		}
	);

	it("finishes successfully on a normal remote closure", async () => {
		const server = await fixture();
		const running = server.run();
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.close();
		await running;
		expect(
			server.requests.filter((request) => !request.path.endsWith("/heartbeat"))
		).toHaveLength(1);
	});

	it("rejects HTTP prepare permission failures before opening a socket", async () => {
		const server = await fixture();
		server.prepareStatus = 403;
		const error = await server.run().catch((reason: unknown) => reason);
		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({
			statusCode: 403,
			rawResponse: { status: 403 },
		});
		expect(String(error)).not.toMatch(/signed-secret|access-secret/);
		expect(server.upgraded.size).toBe(0);
		expect(server.requests).toHaveLength(1);
	});

	it.each([true, false])(
		"preserves structured API errors and request context (signed result: %s)",
		async (signedResult) => {
			const server = await fixture();
			server.prepareStatus = 403;
			const errors = [{ code: 10000, message: "Account access denied" }];
			const messages = [{ message: "Contact the account administrator" }];
			server.prepareEnvelope = {
				success: false,
				errors,
				messages,
				...(signedResult
					? { result: { wsUrl: "wss://example.invalid/?token=signed-secret" } }
					: {}),
			};
			const error = await server.run().catch((reason: unknown) => reason);
			expect(error).toBeInstanceOf(ApiError);
			expect(error).toMatchObject({
				statusCode: 403,
				body: { errors, messages },
				requestId: "fixture-request-id",
				rawResponse: { url: expect.stringContaining("/telemetry/live-tail") },
			});
			expect(String(error)).not.toContain("signed-secret");
		}
	);

	it("rejects invalid preparation responses without exposing a returned URL", async () => {
		const server = await fixture();
		server.prepared = { wsUrl: "https://example.invalid/?token=signed-secret" };
		const error = await server.run().then(
			() => undefined,
			(reason: unknown) => reason
		);
		expect(error).toBeInstanceOf(Error);
		expect(String(error)).not.toContain("signed-secret");
		expect(server.upgraded.size).toBe(0);
	});

	it("sanitizes websocket constructor failures", async () => {
		const server = await fixture();
		vi.mocked(wsModule.default).mockImplementationOnce(() => {
			throw new Error("wss://example.invalid/?key=constructor-secret");
		});
		const error = await server.run().then(
			() => undefined,
			(reason: unknown) => reason
		);
		expect(String(error)).toMatch(/could not open.*connection/i);
		expect(String(error)).not.toContain("constructor-secret");
	});

	it("tears down promptly when the server does not answer a closing handshake", async () => {
		const server = await fixture();
		server.holdClose = true;
		const running = server.run();
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.controller.abort();
		await running;
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0), {
			timeout: 500,
		});
	});

	it("bounds a stalled websocket handshake", async () => {
		const server = await fixture();
		server.holdUpgrade = true;
		await expect(server.run({ connectTimeoutMs: 30 })).rejects.toThrow(
			"Timed out connecting to live tail."
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

	it("does not make a request when already aborted", async () => {
		const server = await fixture();
		server.controller.abort();
		await server.run();
		expect(server.requests).toEqual([]);
	});

	it("stops cleanly when a pipe consumer closes stdout", async () => {
		const server = await fixture();
		const output = new Writable({
			write(_chunk, _encoding, callback) {
				callback(
					Object.assign(new Error("fixture pipe closed"), { code: "EPIPE" })
				);
			},
		});
		const running = server.run({ output });
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.send({ id: "one" });
		await running;
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it.each([false, true])(
		"waits for pending output after abort and safely handles its completion (EPIPE: %s)",
		async (epipe) => {
			const server = await fixture();
			let completeWrite: ((error?: Error | null) => void) | undefined;
			const output = new Writable({
				write(_chunk, _encoding, callback) {
					completeWrite = callback;
				},
			});
			let settled = false;
			const running = server
				.run({ output, shutdownTimeoutMs: 500 })
				.then(() => {
					settled = true;
				});
			await vi.waitFor(() =>
				expect(server.requests.length).toBeGreaterThanOrEqual(2)
			);
			server.send({ id: "one" });
			await vi.waitFor(() => expect(completeWrite).toBeTypeOf("function"));
			server.controller.abort();
			await new Promise((resolve) => setImmediate(resolve));
			expect(settled).toBe(false);
			expect(output.listenerCount("error")).toBeGreaterThan(0);
			completeWrite?.(
				epipe
					? Object.assign(new Error("fixture closed pipe"), { code: "EPIPE" })
					: undefined
			);
			await running;
			await vi.waitFor(() => expect(output.listenerCount("error")).toBe(0));
			expect(output.writableLength).toBe(0);
		}
	);

	it("bounds blocked output shutdown while retaining protection for a late EPIPE callback", async () => {
		const server = await fixture();
		let completeWrite: ((error?: Error | null) => void) | undefined;
		const output = new Writable({
			write(_chunk, _encoding, callback) {
				completeWrite = callback;
			},
		});
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
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.send({ id: "one" });
		await vi.waitFor(() => expect(completeWrite).toBeTypeOf("function"));
		server.controller.abort();
		await vi.waitFor(() => expect(settled).toBe(true), { timeout: 500 });
		expect(String(await running)).toMatch(/Timed out writing live tail output/);
		expect(output.listenerCount("error")).toBeGreaterThan(0);
		completeWrite?.(
			Object.assign(new Error("fixture late closed pipe"), { code: "EPIPE" })
		);
		await vi.waitFor(() => expect(output.listenerCount("error")).toBe(0));
	});

	it("sanitizes asynchronous stdout errors and closes the socket", async () => {
		const server = await fixture();
		const output = new Writable({
			write(_chunk, _encoding, callback) {
				callback(new Error("private filesystem path"));
			},
		});
		const result = server.run({ output }).then(
			() => undefined,
			(reason: unknown) => reason
		);
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.send({ id: "one" });
		const error = await result;
		expect(String(error)).toMatch(/Could not write.*stdout/);
		expect(String(error)).not.toContain("private filesystem path");
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it("sanitizes synchronous stdout errors rather than exposing event-writer details", async () => {
		const server = await fixture();
		const output = new Writable({
			write() {
				throw new Error("private filesystem path");
			},
		});
		const result = server.run({ output }).then(
			() => undefined,
			(reason: unknown) => reason
		);
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.send({ id: "one" });
		const error = await result;
		expect(String(error)).toMatch(/Could not write.*stdout/);
		expect(String(error)).not.toContain("private filesystem path");
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

	it("also treats synchronous EPIPE as a clean consumer shutdown", async () => {
		const server = await fixture();
		const output = new Writable({
			write() {
				throw Object.assign(new Error("fixture pipe closed"), {
					code: "EPIPE",
				});
			},
		});
		const running = server.run({ output });
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		server.send({ id: "one" });
		await running;
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});

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
		await vi.waitFor(() =>
			expect(server.requests.length).toBeGreaterThanOrEqual(2)
		);
		const event = { message: "x".repeat(60_000) };
		for (let index = 0; index < 300; index++) {
			server.send(event);
		}
		expect(String(await result)).toMatch(/output cannot keep up/i);
		expect(output.writableLength).toBeLessThanOrEqual(16 * 1024 * 1024);
		await vi.waitFor(() => expect(server.upgraded.size).toBe(0));
	});
});
