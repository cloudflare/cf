import { writeAuthConfigFile } from "@cloudflare/workers-auth/cf";
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

	it("explains how to log in when not logged in", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: undefined });

		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(`
			"●  You are not currently logged in. To authenticate, run:

			   cf auth login"
		`);
	});

	it("points at the environment token when only that is set", async () => {
		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(std.out).toBe("");
		expect(std.err).toMatchInlineSnapshot(
			`"●  No cf OAuth credentials found, but CLOUDFLARE_API_TOKEN is set. Unset it to log out."`
		);
	});

	it("confirms which file the OAuth tokens were removed from", async () => {
		createDefaultProfile();
		std.setStderrTTY(true);

		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: undefined });

		expect(std.out).toBe("");
		expect(std.err).toContain(
			"✓ Removed OAuth tokens from <cwd>/home/.config/cloudflare/config/default.json"
		);
	});

	it("warns that the environment token still authenticates after logout", async () => {
		createDefaultProfile();

		await runCf(["auth", "logout"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(std.out).toBe("");
		expect(std.err).toContain(
			"▲  CLOUDFLARE_API_TOKEN is still set, so you remain authenticated. Unset it to log out."
		);
	});
});
