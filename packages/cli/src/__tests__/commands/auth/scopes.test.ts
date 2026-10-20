import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { runCf } from "../../helpers/run-cf.js";

describe("cf auth scopes", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		writeAuthConfigFile({
			oauth_token: "oauth-token",
			refresh_token: "refresh-token",
			expiration_time: new Date(Date.now() + 3_600_000).toISOString(),
			scopes: ["openid", "d1:write", "d1.read", "queues.read", "dns.read"],
		});
	});

	it("summarizes granted scopes by product", async () => {
		await runCf(["auth", "scopes"]);

		expect(std.out).toMatch(/Developer Platform +3\/\d+/);
		expect(std.out).toMatch(/DNS & Zones +1\/\d+/);
		expect(std.out).toContain("cf auth scopes <product>");
		expect(std.out).not.toContain("d1");
	});

	it("shows one product's permissions, narrowed by --filter", async () => {
		await runCf(["auth", "scopes", "developer", "--filter", "d1"]);

		expect(std.out).toMatch(/d1 +read, write/);
		expect(std.out).not.toContain("queues");
		expect(std.out).not.toContain("DNS");
	});

	it("shows every product's permissions with --all", async () => {
		await runCf(["auth", "scopes", "--all"]);

		expect(std.out).toMatch(/d1 +read, write/);
		expect(std.out).toMatch(/dns +read/);
	});

	it("explains that an API token has no OAuth scopes", async () => {
		await runCf(["auth", "scopes"], { CLOUDFLARE_API_TOKEN: "test-token" });

		expect(std.out).toContain("CLOUDFLARE_API_TOKEN is set");
	});
});
