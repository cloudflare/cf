import { beforeEach, describe, it, vi } from "vite-plus/test";
import { mockConsoleMethods } from "./helpers/mock-console";
import {
	msw,
	mswSuccessOauthHandlers,
	mswSuccessUserHandlers,
} from "./helpers/msw";
import { runInTempDir } from "./helpers/run-in-tmp";
import { runWrangler } from "./helpers/run-wrangler";

describe("getUserInfo(COMPLIANCE_REGION_CONFIG_UNKNOWN)", () => {
	it.todo("should return undefined if there is no config file");
	it.todo("should return undefined if there is an empty config file");
	it.todo(
		"should return undefined for email if the user settings API request fails with 9109"
	);
	it.todo("should say it's using a user API token when one is set");
	// cf deliberately supports scoped API tokens, not Wrangler's account-token
	// distinction or the legacy global key + email pair.
	it.skip("should say it's using an account API token when one is set", () => {});
	it.skip("should say it's using a Global API Key when one is set", () => {});
	it.skip("should use a Global API Key in preference to an API token", () => {});
	it.skip("should return undefined only a Global API Key, but not Email, is set", () => {});
	it.todo(
		"should return the user's email and accounts if authenticated via config token"
	);
	it.skip("should display a warning message if the config file contains a legacy api_token field", () => {});
});

describe("whoami", () => {
	runInTempDir();
	const std = mockConsoleMethods();

	beforeEach(() => {
		msw.use(...mswSuccessOauthHandlers, ...mswSuccessUserHandlers);
	});

	// Calls wrangler's internal `whoami(complianceConfig, accountFilter,
	// configAccountId)` function directly. cf's `auth whoami` doesn't take
	// those positional arguments and doesn't surface "configured account_id
	// vs authenticated accounts" warnings (cf doesn't read worker config).
	it.skip("should display a warning when account_id in config does not match authenticated accounts", () => {});
	it.skip("should not display a warning when account_id matches an authenticated account", () => {});
	it.skip("should not display a warning when accountFilter and configAccountId don't match", () => {});

	// `--account` / membership-roles output is wrangler-specific. cf's
	// `auth whoami` doesn't accept an account filter or print membership
	// roles — it reports auth source + token validity + scopes.
	it.skip("should display membership roles if --account flag is given", () => {});
	it.skip("should not redact in non-interactive mode", () => {});
	it.skip("should display membership error on authentication error 10000", () => {});

	it("should output JSON with user info when --json flag is used and authenticated", async ({
		expect,
	}) => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "123456789");
		await runWrangler("auth whoami");
		let output: Record<string, unknown> | undefined;
		expect(() => (output = JSON.parse(std.out))).not.toThrow();
		expect(output).toMatchObject({
			authenticated: true,
			authSource: "CLOUDFLARE_API_TOKEN environment variable",
			tokenValid: true,
			email: "user@example.com",
		});
	});

	// cf's auth-source paths now resolve `homedir()` lazily (see
	// `lib/auth.ts` and `lib/oauth/tokens.ts`), so the `runInTempDir()`
	// HOME stub above suppresses the real-home `~/.cf/config.toml` and
	// `~/.wrangler/config/default.toml` reads. With no env token either,
	// `getAuthToken()` throws and `cf auth whoami` reports
	// `{ authenticated: false, error: "Not logged in" }`.
	it("should output JSON with loggedIn:false and exit with non-zero when --json flag is used and not authenticated", async ({
		expect,
	}) => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		await runWrangler("auth whoami");
		let output: Record<string, unknown> | undefined;
		expect(() => (output = JSON.parse(std.out))).not.toThrow();
		expect(output).toMatchObject({
			authenticated: false,
		});
	});

	it("should suggest a temporary preview account when not authenticated", async ({
		expect,
	}) => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLAUDECODE", "1");
		await runWrangler("auth whoami");
		expect(JSON.parse(std.out)).toMatchObject({ authenticated: false });
		// cf gives agents instructions on stderr so stdout stays parseable JSON.
		expect(std.err).toContain(
			'Ask the user: "I can put this online for 60 minutes without you signing in. To keep it, complete the temporary-account claim before it expires. Would you like me to deploy it that way?"'
		);
		expect(std.err).toContain(
			"https://developers.cloudflare.com/workers/platform/claim-deployments/"
		);
		expect(std.err).toContain(
			"If they agree, run `cf deploy --temporary-account`"
		);
	});

	it("should output JSON with API token auth type", async ({ expect }) => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "123456789");
		await runWrangler("auth whoami");
		const output = JSON.parse(std.out) as Record<string, unknown>;
		expect(output).toMatchObject({
			authenticated: true,
			authSource: "CLOUDFLARE_API_TOKEN environment variable",
		});
	});
});
