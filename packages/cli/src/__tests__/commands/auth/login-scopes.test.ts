import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

const sharedAuth = vi.hoisted(() => ({
	activeProfile: "default",
	credentials: undefined as
		| { oauth_token?: string; scopes: string[] }
		| undefined,
	validToken: undefined as string | undefined,
	login: vi.fn(),
}));

vi.mock("@cloudflare/workers-auth/cf", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	createCfAuth: () => ({
		setTemporaryAllowed: vi.fn(),
		setProfile: (profile: string) => {
			sharedAuth.activeProfile = profile;
		},
		getActiveProfile: () => sharedAuth.activeProfile,
		getCredentialStore: () => ({ path: () => "/test/auth.json" }),
		readAuthCredentials: () => sharedAuth.credentials,
		// The stored token reads as valid, so login sits on its
		// already-logged-in path unless it decides to re-authenticate.
		getOAuthTokenFromLocalState: async () => sharedAuth.validToken,
		login: sharedAuth.login,
	}),
}));

const telemetryEvents = vi.hoisted(
	() => [] as Array<{ name: string; properties: Record<string, unknown> }>
);

vi.mock("../../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: false,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetryEvents.push({ name, properties }),
		sendAdhocEvent: vi.fn(),
	}),
}));

/**
 * A stored grant as the OAuth server issues it: `openid`, `offline` and
 * `offline_access` arrive in the granted list but are not requestable cf
 * OAuth scope keys, so they cannot be replayed into `--scopes`.
 */
const storedScopes = ["openid", "offline", "offline_access"];

describe("cf auth login with scopes on an existing login", () => {
	runInTempDir();
	mockOutputStreams();

	beforeEach(() => {
		sharedAuth.activeProfile = "default";
		sharedAuth.credentials = undefined;
		sharedAuth.validToken = undefined;
		sharedAuth.login.mockReset().mockResolvedValue(true);
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
	});

	it("does not silently succeed when --scopes asks for a scope the login does not hold", async () => {
		sharedAuth.credentials = {
			oauth_token: "token",
			scopes: [...storedScopes],
		};
		sharedAuth.validToken = "token";

		const result = await runCf([
			"auth",
			"login",
			"--no-browser",
			"--scopes",
			"dns.read",
		]);

		// Either re-authenticating for the new scope or refusing with a
		// non-zero exit is fine; exiting 0 while ignoring --scopes is not.
		if (!sharedAuth.login.mock.calls.length) {
			expect(result.exitCode).not.toBe(0);
		}
	});

	it("names the requested scopes that are not valid cf OAuth scopes", async () => {
		sharedAuth.credentials = {
			oauth_token: "token",
			scopes: [...storedScopes],
		};
		sharedAuth.validToken = "token";

		await expect(
			runCf([
				"auth",
				"login",
				"--force",
				"--no-browser",
				"--scopes",
				...storedScopes,
				"dns.read",
			])
		).rejects.toThrow(/offline_access/);
	});
});
