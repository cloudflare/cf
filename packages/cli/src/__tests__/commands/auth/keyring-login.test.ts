import {
	readUserPreferences,
	updateUserPreferences,
} from "@cloudflare/workers-auth/cf";
import {
	mockConsoleMethods,
	runInTempDir,
} from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { runCf } from "../../helpers/run-cf.js";

const sharedAuth = vi.hoisted(() => ({
	activeProfile: "default",
	getCredentialStore: vi.fn(),
	getOAuthTokenFromLocalState: vi.fn(),
	readAuthCredentials: vi.fn(),
	login: vi.fn(),
}));

const telemetryEvents = vi.hoisted(
	() => [] as Array<{ name: string; properties: Record<string, unknown> }>
);

vi.mock("@cloudflare/workers-auth/cf", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	createCfAuth: () => ({
		setProfile: (profile: string) => {
			sharedAuth.activeProfile = profile;
		},
		getActiveProfile: () => sharedAuth.activeProfile,
		getCredentialStore: sharedAuth.getCredentialStore,
		getOAuthTokenFromLocalState: sharedAuth.getOAuthTokenFromLocalState,
		readAuthCredentials: sharedAuth.readAuthCredentials,
		login: sharedAuth.login,
	}),
}));

vi.mock("../../../lib/telemetry/dispatcher.js", () => ({
	getTelemetryDispatcher: () => ({
		enabled: true,
		sendCommandEvent: (name: string, properties: Record<string, unknown>) =>
			telemetryEvents.push({ name, properties }),
		sendAdhocEvent: vi.fn(),
	}),
}));

describe("cf auth login keyring preference", () => {
	runInTempDir();
	const std = mockConsoleMethods();
	const credentials = { oauth_token: "test-token" };
	const encryptedStore = { kind: "encrypted-file", path: () => "auth.enc" };

	beforeEach(() => {
		sharedAuth.activeProfile = "default";
		sharedAuth.getCredentialStore.mockReset().mockReturnValue(encryptedStore);
		sharedAuth.getOAuthTokenFromLocalState
			.mockReset()
			.mockResolvedValue(credentials.oauth_token);
		sharedAuth.readAuthCredentials.mockReset().mockReturnValue(credentials);
		sharedAuth.login.mockReset().mockResolvedValue(true);
		telemetryEvents.length = 0;
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_AUTH_USE_KEYRING", undefined);
	});

	it.each(["--use-keyring", "--useKeyring"])(
		"persists %s before reading existing credentials",
		async (flag) => {
			sharedAuth.getCredentialStore.mockImplementation(() => {
				expect(sharedAuth.activeProfile).toBe("default");
				expect(readUserPreferences().keyring_enabled).toBe(true);
				return encryptedStore;
			});
			sharedAuth.readAuthCredentials.mockImplementation(() => {
				expect(readUserPreferences().keyring_enabled).toBe(true);
				return credentials;
			});

			await runCf(["auth", "login", flag]);

			expect(readUserPreferences().keyring_enabled).toBe(true);
			expect(sharedAuth.login).not.toHaveBeenCalled();
			expect(std.out).toContain("You are already logged in.");
		}
	);

	it.each(["--no-use-keyring", "--use-keyring=false", "--no-useKeyring"])(
		"persists %s before accessing an unavailable backend",
		async (flag) => {
			updateUserPreferences({ keyring_enabled: true });
			sharedAuth.getCredentialStore.mockImplementation(() => {
				if (readUserPreferences().keyring_enabled) {
					throw new Error("Keyring backend is unavailable");
				}
				return { kind: "file", path: () => "auth.json" };
			});
			sharedAuth.readAuthCredentials.mockImplementation(() => {
				sharedAuth.getCredentialStore();
				return undefined;
			});
			sharedAuth.login.mockImplementation(async () => {
				expect(readUserPreferences().keyring_enabled).toBe(false);
				return true;
			});

			await runCf(["auth", "login", flag, "--no-browser"]);

			expect(readUserPreferences().keyring_enabled).toBe(false);
			expect(sharedAuth.login).toHaveBeenCalledOnce();
		}
	);

	it.each([true, false, undefined])(
		"preserves the %s preference when the flag is omitted",
		async (enabled) => {
			if (enabled !== undefined) {
				updateUserPreferences({ keyring_enabled: enabled });
			}
			const previous = readUserPreferences();

			await runCf(["auth", "login"]);

			expect(readUserPreferences()).toEqual(previous);
		}
	);

	it("honors the environment override while persisting the requested preference", async () => {
		await runCf(["auth", "login", "--use-keyring"], {
			CLOUDFLARE_AUTH_USE_KEYRING: "false",
		});

		expect(readUserPreferences().keyring_enabled).toBe(true);
		expect(std.err).toContain(
			"CLOUDFLARE_AUTH_USE_KEYRING=false overrides enabling keyring storage"
		);
	});

	it("supports the cf login alias and records the boolean as telemetry-safe", async () => {
		await runCf(["login", "--use-keyring"]);

		expect(readUserPreferences().keyring_enabled).toBe(true);
		expect(telemetryEvents[0]).toMatchObject({
			name: "cf command started",
			properties: {
				command: "login",
				sanitizedArgs: { "use-keyring": true },
			},
		});
	});

	it.each([
		["--use-keyring", "use-keyring", true],
		["--no-use-keyring", "use-keyring", false],
		["--useKeyring", "useKeyring", true],
		["--no-useKeyring", "useKeyring", false],
	] as const)("records %s as boolean telemetry", async (flag, key, enabled) => {
		await runCf(["auth", "login", flag]);

		expect(telemetryEvents[0]).toMatchObject({
			name: "cf command started",
			properties: {
				command: "auth login",
				sanitizedArgs: { [key]: enabled },
			},
		});
	});

	it.each(["--help", "--dry-run"])(
		"does not change the preference with %s",
		async (flag) => {
			await runCf(["auth", "login", "--use-keyring", flag]);

			expect(readUserPreferences().keyring_enabled).toBeUndefined();
			expect(sharedAuth.login).not.toHaveBeenCalled();
		}
	);

	it("rejects --profile before changing the preference", async () => {
		await expect(
			runCf(["auth", "login", "--use-keyring", "--profile", "work"])
		).rejects.toThrow("cf auth create <name>");

		expect(readUserPreferences().keyring_enabled).toBeUndefined();
	});
});
