import { describe, expect, it, vi } from "vite-plus/test";
import {
	BadRequestError,
	UnauthorizedError,
} from "../../sdk/sdk/api/errors/index.js";
import { CloudflareApiClient } from "#sdk/client";
import { CloudflareApiError } from "#sdk/errors";

vi.mock("../../sdk/sdk/api/index.js", () => {
	throw new Error(
		"SDK clients must not load the API barrel to construct errors."
	);
});

describe("SDK runtime error imports", () => {
	function client(status: number, body: unknown): CloudflareApiClient {
		return new CloudflareApiClient({
			auth: async () => ({ headers: { Authorization: "Bearer test-token" } }),
			maxRetries: 0,
			fetch: async () =>
				new Response(JSON.stringify(body), {
					status,
					headers: { "Content-Type": "application/json" },
				}),
		});
	}

	it("preserves nested resource error class identity and response data", async () => {
		const body = { errors: [{ code: 1000, message: "Invalid query" }] };
		const error = await client(400, body)
			.analyticsEngine.sql.query({ account_id: "account-id" })
			.catch((value: unknown) => value);
		expect(error).toBeInstanceOf(BadRequestError);
		expect(error).toBeInstanceOf(CloudflareApiError);
		expect(error).toMatchObject({
			name: "BadRequestError",
			statusCode: 400,
			body,
			rawResponse: { status: 400 },
		});
	});

	it("preserves root client errors", async () => {
		const body = { errors: [{ code: 1001, message: "Unauthorized" }] };
		const error = await client(401, body)
			.getAccountOrZoneEntitlements({
				account_or_zone: "accounts",
				account_or_zone_id: "account-id",
			})
			.catch((value: unknown) => value);
		expect(error).toBeInstanceOf(UnauthorizedError);
		expect(error).toBeInstanceOf(CloudflareApiError);
		expect(error).toMatchObject({ statusCode: 401, body });
	});

	it("keeps unknown HTTP statuses as base SDK errors", async () => {
		const error = await client(418, { message: "Unexpected status" })
			.zones.get({ zone_id: "zone-id" })
			.catch((value: unknown) => value);
		expect(error).toBeInstanceOf(CloudflareApiError);
		expect(error).toMatchObject({
			statusCode: 418,
			body: { message: "Unexpected status" },
		});
	});
});
