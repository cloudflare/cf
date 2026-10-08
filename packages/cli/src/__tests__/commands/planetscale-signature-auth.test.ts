import { readFileSync } from "node:fs";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { server, setupMsw, TEST_BASE_URL } from "../helpers/msw.js";
import { runCf } from "../helpers/run-cf.js";

const mocks = vi.hoisted(() => ({
	ensurePlanetScaleSetupScope: vi.fn(),
}));

vi.mock(
	"#commands/hyperdrive/integration/planetscale/signature/oauth.js",
	() => ({
		ensurePlanetScaleSetupScope: mocks.ensurePlanetScaleSetupScope,
	})
);

const ACCOUNT_ID = "00000000000000000000000000000000";
const ENV = {
	CI: "true",
	CLOUDFLARE_ACCOUNT_ID: ACCOUNT_ID,
	CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	CLOUDFLARE_API_TOKEN: "stale-token",
};

describe("cf hyperdrive integration planetscale signature", () => {
	runInTempDir();
	setupMsw();
	const std = mockConsoleMethods();

	beforeEach(() => {
		mocks.ensurePlanetScaleSetupScope.mockReset().mockImplementation(() => {
			vi.stubEnv("CLOUDFLARE_API_TOKEN", "authorized-token");
		});
	});

	it("authorizes before creating the API client", async () => {
		let authorization: string | null = null;
		server.use(
			http.post(
				`${TEST_BASE_URL}/accounts/:accountId/hyperdrive/integrationsOperations/planetScale/createDatabaseSignature`,
				({ request }) => {
					authorization = request.headers.get("authorization");
					return HttpResponse.json({
						success: true,
						result: {
							account_id: ACCOUNT_ID,
							timestamp: "1700000000",
							signature: "signed",
						},
					});
				}
			)
		);

		expect(
			await runCf(
				["hyperdrive", "integration", "planetscale", "signature"],
				ENV
			)
		).toEqual({ exitCode: 0 });
		expect(mocks.ensurePlanetScaleSetupScope).toHaveBeenCalledWith(false);
		expect(authorization).toBe("Bearer authorized-token");
		expect(std.out).toContain('"signature": "signed"');
	});

	it("does not authorize during a dry run", async () => {
		expect(
			await runCf(
				[
					"hyperdrive",
					"integration",
					"planetscale",
					"signature",
					"--dry-run",
				],
				ENV
			)
		).toEqual({ exitCode: 0 });
		expect(mocks.ensurePlanetScaleSetupScope).not.toHaveBeenCalled();
	});
});

describe("PlanetScale signature spec drift", () => {
	const metadata = JSON.parse(
		readFileSync(
			new URL("../../commands/_generated/_meta/schemas.json", import.meta.url),
			"utf-8"
		)
	) as { schemas: Record<string, Record<string, unknown>> };
	const spec = metadata.schemas["hyperdrive integration planetscale signature"];

	it("retains the bodyless PlanetScale signature endpoint", () => {
		expect(spec).toMatchObject({
			operationId: "create-hyperdrive-database-signature",
			httpMethod: "POST",
			path: "/accounts/{account_id}/hyperdrive/integrationsOperations/planetScale/createDatabaseSignature",
			pathParams: [
				{ name: "account_id", type: "string", required: true },
			],
			queryParams: [],
			hasRequestBody: false,
			requestBodyFields: [],
		});
	});
});
