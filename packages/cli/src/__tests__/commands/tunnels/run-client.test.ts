import { describe, expect, it, vi } from "vite-plus/test";
import {
	getTunnelToken,
	resolveTunnelId,
} from "../../../commands/tunnels/run/client.js";
import type { Cloudflare } from "../../../lib/auth.js";

const UUID = "f70ff985-a4ef-4643-bbbc-4a0ed4fc8415";

function makeClient(overrides: {
	list?: (request: unknown) => Promise<unknown>;
	token?: (request: unknown) => Promise<unknown>;
}): Cloudflare {
	return {
		tunnel: {
			list: overrides.list ?? vi.fn(),
		},
		tunnels: {
			token: { get: overrides.token ?? vi.fn() },
		},
	} as unknown as Cloudflare;
}

describe("resolveTunnelId", () => {
	it("returns a UUID without making a list request", async () => {
		const list = vi.fn();
		await expect(
			resolveTunnelId(makeClient({ list }), "account", UUID)
		).resolves.toBe(UUID);
		expect(list).not.toHaveBeenCalled();
	});

	it("resolves one exact name match", async () => {
		const client = makeClient({
			list: async () => ({
				result: [
					{ id: "other", name: "production-old" },
					{ id: UUID, name: "production" },
				],
			}),
		});
		await expect(
			resolveTunnelId(client, "account", "production")
		).resolves.toBe(UUID);
	});

	it("scans every page for exact and duplicate names", async () => {
		const list = vi.fn(async (request: unknown) => {
			const { page } = request as { page: number };
			return page === 1
				? {
						result: [
							{ id: "other", name: "production-old" },
							{ id: UUID, name: "production" },
						],
						result_info: { per_page: 2 },
					}
				: {
						result: [{ id: "duplicate", name: "production" }],
						result_info: { per_page: 2 },
					};
		});

		await expect(
			resolveTunnelId(makeClient({ list }), "account", "production")
		).rejects.toThrow(/multiple tunnels/);
		expect(list).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ page: 2, per_page: 1000 })
		);
	});

	it("rejects missing and ambiguous names", async () => {
		const missing = makeClient({ list: async () => ({ result: [] }) });
		await expect(
			resolveTunnelId(missing, "account", "missing")
		).rejects.toThrow(/neither the ID nor the name/);

		const ambiguous = makeClient({
			list: async () => ({
				result: [
					{ id: "one", name: "duplicate" },
					{ id: "two", name: "duplicate" },
				],
			}),
		});
		await expect(
			resolveTunnelId(ambiguous, "account", "duplicate")
		).rejects.toThrow(/multiple tunnels/);
	});
});

describe("getTunnelToken", () => {
	it("returns a non-empty token", async () => {
		const client = makeClient({ token: async () => "tunnel-token" });
		await expect(getTunnelToken(client, "account", UUID)).resolves.toBe(
			"tunnel-token"
		);
	});

	it("rejects an empty token response", async () => {
		const client = makeClient({ token: async () => "" });
		await expect(getTunnelToken(client, "account", UUID)).rejects.toThrow(
			/empty token/
		);
	});
});
