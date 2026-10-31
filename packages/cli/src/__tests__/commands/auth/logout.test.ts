import {
	readAuthConfigFile,
	writeAuthConfigFile,
} from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { http, HttpResponse } from "msw/http";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { server, setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

function createDefaultProfile(): void {
	writeAuthConfigFile(
		{ oauth_token: "token", expiration_time: "2999-01-01T00:00:00.000Z" },
		"default"
	);
}

describe("cf auth logout", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();

	beforeEach(() => {
		server.use(
			http.post(
				"https://dash.cloudflare.com/oauth2/revoke",
				() => new HttpResponse("")
			)
		);
	});

	it("reports when not logged in", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: undefined });

		expect(std.out).toBe("");
		expect(std.err).toBe("Not logged in, exiting...");
	});

	it("points at the environment token when only that is set", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(std.out).toBe("");
		expect(std.err).toContain(
			"You are logged in with an API Token. Unset the CLOUDFLARE_API_TOKEN in the environment to log out."
		);
	});

	it("removes the OAuth tokens and confirms logout", async () => {
		createDefaultProfile();
		std.setStderrTTY(true);

		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: undefined });

		expect(std.out).toBe("");
		expect(readAuthConfigFile("default")).toBeUndefined();
		expect(std.err).toContain("Successfully logged out.");
	});

	it("keeps the OAuth tokens while the environment token is set", async () => {
		createDefaultProfile();
		std.setStderrTTY(true);

		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(readAuthConfigFile("default")?.oauth_token).toBe("token");
		expect(std.out).toBe("");
		expect(std.err).toContain(
			"Unset the CLOUDFLARE_API_TOKEN in the environment to log out."
		);
		expect(std.err).not.toContain("✓");
	});
});
