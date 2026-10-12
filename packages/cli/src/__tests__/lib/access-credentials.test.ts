import { describe, expect, it, vi } from "vite-plus/test";
import {
	describeAccessToken,
	detectAccessProtection,
} from "../../lib/access-credentials.js";

function jwt(claims: Record<string, unknown>): string {
	const encode = (value: object): string =>
		Buffer.from(JSON.stringify(value)).toString("base64url");
	return `${encode({ alg: "RS256" })}.${encode(claims)}.signature`;
}

describe("detectAccessProtection", () => {
	it("reports the team domain and supported methods", async () => {
		const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
			new Response(
				JSON.stringify({
					protected: true,
					team_domain: "example.cloudflareaccess.com",
					authentication_methods: [{ name: "cloudflared" }, { name: "oauth" }],
				}),
				{ status: 200 }
			)
		);

		await expect(
			detectAccessProtection("https://ai.example.com", fetchMock)
		).resolves.toEqual({
			protected: true,
			teamDomain: "example.cloudflareaccess.com",
			methods: ["cloudflared", "oauth"],
		});

		const [url] = fetchMock.mock.calls[0] ?? [];
		expect(url).toBe(
			"https://ai.example.com/.well-known/cloudflare-access-protected-resource"
		);
	});

	it("reports an unprotected endpoint when the document is absent", async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockResolvedValue(new Response("not found", { status: 404 }));

		await expect(
			detectAccessProtection("https://ai.example.com", fetchMock)
		).resolves.toEqual({ protected: false, methods: [] });
	});

	it("treats a network failure as unprotected rather than throwing", async () => {
		const fetchMock = vi
			.fn<typeof fetch>()
			.mockRejectedValue(new Error("offline"));

		await expect(
			detectAccessProtection("https://ai.example.com", fetchMock)
		).resolves.toEqual({ protected: false, methods: [] });
	});
});

describe("describeAccessToken", () => {
	it("decodes the identity claims", () => {
		const token = jwt({
			email: "someone@cloudflare.com",
			sub: "user-id",
			iat: 1_700_000_000,
			exp: 1_700_003_600,
		});

		expect(describeAccessToken(token)).toMatchObject({
			email: "someone@cloudflare.com",
			sub: "user-id",
		});
	});

	it("returns undefined for a malformed token", () => {
		expect(describeAccessToken("not-a-jwt")).toBeUndefined();
	});
});
