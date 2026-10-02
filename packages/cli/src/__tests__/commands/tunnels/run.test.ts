import { writeFile } from "node:fs/promises";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCloudflared } from "../../../commands/cloudflared.js";
import { server, setupMsw, TEST_BASE_URL } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("../../../commands/cloudflared.js", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	runCloudflared: vi.fn(),
}));

const UUID = "f70ff985-a4ef-4643-bbbc-4a0ed4fc8415";
const API_ENV = {
	CLOUDFLARE_ACCOUNT_ID: "account-id",
	CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
	CLOUDFLARE_API_TOKEN: "api-token",
};

describe("cf tunnels run", () => {
	runInTempDir();
	setupMsw();

	beforeEach(() => {
		vi.mocked(runCloudflared).mockReset();
		vi.mocked(runCloudflared).mockResolvedValue(0);
	});

	it("resolves a tunnel name and fetches its token", async () => {
		server.use(
			http.get(`${TEST_BASE_URL}/accounts/account-id/cfd_tunnel`, () =>
				HttpResponse.json({
					success: true,
					result: [{ id: UUID, name: "production" }],
				})
			),
			http.get(
				`${TEST_BASE_URL}/accounts/account-id/cfd_tunnel/${UUID}/token`,
				() => HttpResponse.json({ success: true, result: "run-token" })
			)
		);

		const result = await runCf(["tunnels", "run", "production"], API_ENV);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith(
			["tunnel", "--loglevel", "info", "run"],
			{ env: { TUNNEL_TOKEN: "run-token" } }
		);
	});

	it("restores dotenv values before starting cloudflared", async () => {
		await writeFile(
			".env",
			[
				"CLOUDFLARE_ACCOUNT_ID=account-id",
				"CLOUDFLARE_API_TOKEN=file-token",
			].join("\n")
		);
		let valueDuringApiRequest: string | undefined;
		let authorizationDuringApiRequest: string | null = null;
		server.use(
			http.get(
				`${TEST_BASE_URL}/accounts/account-id/cfd_tunnel`,
				({ request }) => {
					valueDuringApiRequest = process.env.CLOUDFLARE_ACCOUNT_ID;
					authorizationDuringApiRequest = request.headers.get("authorization");
					return HttpResponse.json({
						success: true,
						result: [{ id: UUID, name: "production" }],
					});
				}
			),
			http.get(
				`${TEST_BASE_URL}/accounts/account-id/cfd_tunnel/${UUID}/token`,
				() => HttpResponse.json({ success: true, result: "run-token" })
			)
		);
		let observedAccountId: string | undefined;
		vi.mocked(runCloudflared).mockImplementationOnce(async () => {
			observedAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
			return 0;
		});

		const result = await runCf(["tunnels", "run", "production"], {
			CLOUDFLARE_ACCOUNT_ID: undefined,
			CLOUDFLARE_API_BASE_URL: TEST_BASE_URL,
			CLOUDFLARE_API_TOKEN: undefined,
		});

		expect(result.exitCode).toBe(0);
		expect(valueDuringApiRequest).toBe("account-id");
		expect(authorizationDuringApiRequest).toBe("Bearer file-token");
		expect(observedAccountId).toBeUndefined();
		expect(process.env.CLOUDFLARE_ACCOUNT_ID).toBeUndefined();
	});

	it("uses a literal token without an API request", async () => {
		const result = await runCf([
			"tunnels",
			"run",
			"--token",
			"literal-token",
			"--log-level",
			"disabled",
		]);

		expect(result.exitCode).toBe(0);
		expect(runCloudflared).toHaveBeenCalledWith(
			["tunnel", "--loglevel", "disabled", "run"],
			{ env: { TUNNEL_TOKEN: "literal-token" } }
		);
	});

	it("requires a tunnel when no token is provided", async () => {
		await expect(runCf(["tunnels", "run"])).rejects.toThrow(
			"Either a tunnel name/UUID or --token must be provided."
		);
	});

	it("rejects local mode", async () => {
		await expect(
			runCf(["tunnels", "run", UUID, "--local", "--persist-to", "state"])
		).rejects.toThrow("--local is not supported by cf tunnels run.");
	});

	it("does not keep the former cf tunnel root", async () => {
		await expect(runCf(["tunnel", "run", UUID])).rejects.toThrow(
			"Unknown commands: tunnel, run"
		);
	});
});
