import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { getGlobalConfigPath } from "@cloudflare/workers-utils";
import { http, HttpResponse } from "msw";
import { describe, it } from "vitest";
import { mockConsoleMethods } from "./helpers/mock-console";
import { msw } from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

/**
 * Absolute path to cf's default OAuth profile. Computed lazily so the
 * `runInTempDir()` HOME / XDG_CONFIG_HOME stubs are honoured.
 */
function cfAuthFilePath(): string {
	return join(
		getGlobalConfigPath({
			appName: "cloudflare",
			leadingDot: false,
			useLegacyHomeDir: false,
		}),
		"config",
		"default.json"
	);
}

describe("logout", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	// cf's `loadTokens()` / `loadApiToken()` now resolve their paths via
	// `homedir()` at call time, so `runInTempDir()`'s HOME stub correctly
	// isolates token reads to the empty temp directory.
	it("should exit with a message stating the user is not logged in", async ({
		expect,
	}) => {
		await runWrangler("auth logout", { CLOUDFLARE_API_TOKEN: undefined });
		expect(std.out).toContain("You are not currently logged in.");
	});

	// Env `CLOUDFLARE_API_TOKEN` set with no on-disk credentials in the
	// stubbed HOME: cf prints the env-var hint and exits cleanly.
	it("should exit with a message stating the user logged in via API token", async ({
		expect,
	}) => {
		await runWrangler("auth logout", { CLOUDFLARE_API_TOKEN: "DUMMY_TOKEN" });
		expect(std.out).toContain(
			"No cf OAuth credentials found, but CLOUDFLARE_API_TOKEN environment variable is set."
		);
		expect(std.out).toContain("Unset it with: unset CLOUDFLARE_API_TOKEN");
	});

	// Ported now that token paths resolve via `homedir()` at call time
	// (test_bug: auth-paths-resolved-at-import — Fixed). cf stores its
	// OAuth tokens as JSON at `<xdg>/cloudflare/config/default.json` (shape:
	// `oauth_token` / `refresh_token` / `expiration_time` / `scopes`)
	// and, on logout, POSTs the refresh token to the revocation endpoint
	// before deleting the file. With HOME / XDG_CONFIG_HOME stubbed to
	// the temp dir we can seed that file, then assert the token is
	// revoked and the file removed.
	//
	it("should logout user that has been properly logged in", async ({
		expect,
	}) => {
		const authFile = cfAuthFilePath();
		mkdirSync(dirname(authFile), { recursive: true });
		writeFileSync(
			authFile,
			JSON.stringify({
				oauth_token: "some-oauth-tok",
				refresh_token: "some-refresh-tok",
				// Far-future so the access token reads as valid (logout only
				// needs the refresh token, but keep the record coherent).
				expiration_time: "2999-01-01T00:00:00.000Z",
				scopes: ["account:read"],
			})
		);

		let revoked = false;
		msw.use(
			http.post("https://dash.cloudflare.com/oauth2/revoke", () => {
				revoked = true;
				return new HttpResponse(null, { status: 200 });
			})
		);

		expect(existsSync(authFile)).toBe(true);

		await runWrangler("auth logout", { CLOUDFLARE_API_TOKEN: undefined });

		// cf reports the credential kind and path that it removed.
		expect(std.out).toContain("Removed: OAuth tokens from");
		// The refresh token was sent to the revocation endpoint.
		expect(revoked).toBe(true);
		// And the on-disk token file was removed.
		expect(existsSync(authFile)).toBe(false);
	});

	// Wrangler-internal: asserted that `wrangler.jsonc` parsing warnings
	// don't surface during logout. cf does NOT read `wrangler.jsonc` /
	// `wrangler.toml` at all (per `AGENTS.md` — "cf does NOT read project
	// worker config"), so there's nothing to assert.
	it.skip("should not display warnings from wrangler configuration parsing when logging out", async () => {});

	// Wrangler-internal: same reason as above. cf doesn't open
	// `wrangler.jsonc` and so cannot care that it's unparsable.
	it.skip("should still log out when wrangler configuration is unparsable", async () => {});

	// Wrangler-internal: same reason as above. cf doesn't validate
	// `wrangler.toml` shape.
	it.skip("should still log out when wrangler configuration contains an error", async () => {});
});
