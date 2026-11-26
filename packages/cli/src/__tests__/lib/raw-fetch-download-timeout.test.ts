import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";

// Shrink the standard API deadline so a download that outlasts it can be
// exercised in milliseconds rather than a minute.
vi.mock("../../lib/api-constants.js", () => ({ API_TIMEOUT_MS: 200 }));

const { fetchRawBytes } = await import("../../lib/raw-fetch.js");

/**
 * Raw downloads, such as `cf r2 objects get`, must not be cut off while
 * the response body is still arriving (cloudflare/cf#796).
 */
describe("fetchRawBytes download deadline", () => {
	let server: Server | undefined;
	let originalApiToken: string | undefined;
	let originalBase: string | undefined;

	beforeEach(() => {
		originalApiToken = process.env.CLOUDFLARE_API_TOKEN;
		originalBase = process.env.CLOUDFLARE_API_BASE_URL;
		process.env.CLOUDFLARE_API_TOKEN = "prod-token";
	});

	afterEach(async () => {
		if (originalApiToken === undefined) {
			delete process.env.CLOUDFLARE_API_TOKEN;
		} else {
			process.env.CLOUDFLARE_API_TOKEN = originalApiToken;
		}
		if (originalBase === undefined) {
			delete process.env.CLOUDFLARE_API_BASE_URL;
		} else {
			process.env.CLOUDFLARE_API_BASE_URL = originalBase;
		}
		const current = server;
		server = undefined;
		if (current) {
			current.closeAllConnections();
			await new Promise<void>((resolve) => current.close(() => resolve()));
		}
	});

	async function listen(
		handler: Parameters<typeof createServer>[1]
	): Promise<void> {
		server = createServer(handler);
		await new Promise<void>((resolve) =>
			server?.listen(0, "127.0.0.1", () => resolve())
		);
		const { port } = server.address() as AddressInfo;
		process.env.CLOUDFLARE_API_BASE_URL = `http://127.0.0.1:${port}/client/v4`;
	}

	it("finishes a download that keeps receiving data past the API deadline", async () => {
		const chunk = Buffer.alloc(1024, 7);
		const chunks = 12;
		await listen((_req, res) => {
			res.writeHead(200, { "Content-Type": "application/octet-stream" });
			let sent = 0;
			const timer = setInterval(() => {
				res.write(chunk);
				sent++;
				if (sent === chunks) {
					clearInterval(timer);
					res.end();
				}
			}, 50);
			res.on("close", () => clearInterval(timer));
		});

		// 12 chunks, 50 ms apart: ~600 ms in all, three times the 200 ms
		// deadline, yet never more than 50 ms without data.
		const bytes = await fetchRawBytes(
			"/accounts/abc/r2/buckets/b/objects/large.bin"
		);

		expect(bytes.length).toBe(chunk.length * chunks);
	});

	it("still aborts a download whose connection stalls", async () => {
		await listen((_req, res) => {
			res.writeHead(200, { "Content-Type": "application/octet-stream" });
			res.write(Buffer.alloc(16));
			// Never send anything more.
		});

		await expect(
			fetchRawBytes("/accounts/abc/r2/buckets/b/objects/stalled.bin")
		).rejects.toThrow();
	});
});
