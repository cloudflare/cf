import {
	readUserPreferences,
	updateUserPreferences,
} from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { runCf } from "../../helpers/run-cf.js";

vi.mock("@cloudflare/workers-auth", async (importOriginal) => ({
	...(await importOriginal<Record<string, unknown>>()),
	resolveKeyProvider: vi.fn(),
}));

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
		setTemporaryAllowed: vi.fn(),
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
	const std = mockOutputStreams();
	const credentials = { oauth_token: "test-token" };
	const encryptedStore = { kind: "encrypted-file", path: () => "auth.enc" };

	beforeEach(() => {
		vi.mocked(resolveKeyProvider).mockReset().mockReturnValue({
			kind: "unsupported",
		});
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
			expect(std.out).toBe("");
			expect(std.err).toContain("You are already logged in.");
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

	it.each([true, false])(
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

	it("enables keyring storage after verifying the backend, before reading credentials", async () => {
		let storedKey: Uint8Array | undefined;
		const provider = {
			setKey: vi.fn((key: Uint8Array) => {
				storedKey = key;
			}),
			getKey: vi.fn(() => storedKey),
			deleteKey: vi.fn(() => {
				storedKey = undefined;
			}),
			describe: () => "test keyring",
		};
		vi.mocked(resolveKeyProvider).mockReturnValue({
			kind: "available",
			provider,
		});
		sharedAuth.readAuthCredentials.mockImplementation(() => {
			expect(readUserPreferences().keyring_enabled).toBe(true);
			return credentials;
		});

		await runCf(["auth", "login"]);

		expect(provider.setKey).toHaveBeenCalledOnce();
		expect(provider.getKey).toHaveBeenCalledOnce();
		expect(provider.deleteKey).toHaveBeenCalledOnce();
		expect(storedKey).toBeUndefined();
		expect(resolveKeyProvider).toHaveBeenCalledWith(
			"cloudflare",
			expect.stringMatching(/^keyring-probe-/),
			expect.any(String)
		);
		expect(std.out).toBe("");
	});

	it("falls back with a one-time warning, including under --quiet, and retries later", async () => {
		await runCf(["auth", "login", "--quiet"]);

		expect(readUserPreferences().keyring_enabled).toBeUndefined();
		expect(std.out).toBe("");
		expect(std.getAndClearErr()).toContain(
			"OAuth credentials will be stored in a plaintext file"
		);

		await runCf(["auth", "login", "--quiet"]);

		expect(resolveKeyProvider).toHaveBeenCalledTimes(2);
		expect(std.err).toBe("");
	});

	it("does not install a missing Windows binding automatically", async () => {
		const install = vi.fn();
		vi.mocked(resolveKeyProvider).mockReturnValue({
			kind: "needs-install",
			install,
			afterInstall: vi.fn(),
		});

		await runCf(["auth", "login"]);

		expect(install).not.toHaveBeenCalled();
		expect(readUserPreferences().keyring_enabled).toBeUndefined();
		expect(std.err).toContain("plaintext file");
	});

	it.each(["setKey", "getKey", "deleteKey"] as const)(
		"falls back when the backend fails to %s and attempts probe cleanup",
		async (method) => {
			const provider = {
				setKey: vi.fn(),
				getKey: vi.fn(() => new Uint8Array(32)),
				deleteKey: vi.fn(),
				describe: () => "unreachable keyring",
			};
			provider[method].mockImplementation(() => {
				throw new Error("Backend unavailable");
			});
			vi.mocked(resolveKeyProvider).mockReturnValue({
				kind: "available",
				provider,
			});

			await runCf(["auth", "login"]);

			expect(provider.deleteKey).toHaveBeenCalledOnce();
			expect(readUserPreferences().keyring_enabled).toBeUndefined();
			expect(std.err).toContain("plaintext file");
		}
	);

	it.each([undefined, new Uint8Array(1), new Uint8Array(32)])(
		"rejects a backend that does not return the stored probe key (%s)",
		async (stored) => {
			const deleteKey = vi.fn();
			vi.mocked(resolveKeyProvider).mockReturnValue({
				kind: "available",
				provider: {
					setKey: vi.fn(),
					getKey: () => stored,
					deleteKey,
					describe: () => "broken keyring",
				},
			});

			await runCf(["auth", "login"]);

			expect(deleteKey).toHaveBeenCalledOnce();
			expect(readUserPreferences().keyring_enabled).toBeUndefined();
			expect(std.err).toContain("plaintext file");
		}
	);

	it.each(["true", "false"])(
		"does not probe or persist a default with CLOUDFLARE_AUTH_USE_KEYRING=%s",
		async (enabled) => {
			await runCf(["auth", "login"], {
				CLOUDFLARE_AUTH_USE_KEYRING: enabled,
			});

			expect(resolveKeyProvider).not.toHaveBeenCalled();
			expect(readUserPreferences().keyring_enabled).toBeUndefined();
			expect(std.err).not.toContain("plaintext file");
		}
	);

	it("does not probe while an API token takes precedence", async () => {
		await runCf(["auth", "login"], { CLOUDFLARE_API_TOKEN: "env-token" });

		expect(resolveKeyProvider).not.toHaveBeenCalled();
		expect(readUserPreferences().keyring_enabled).toBeUndefined();
		expect(sharedAuth.login).not.toHaveBeenCalled();
	});

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
			expect(resolveKeyProvider).not.toHaveBeenCalled();
		}
	);

	it("rejects --profile before changing the preference", async () => {
		await expect(
			runCf(["auth", "login", "--use-keyring", "--profile", "work"])
		).rejects.toThrow("cf auth create <name>");

		expect(readUserPreferences().keyring_enabled).toBeUndefined();
		expect(resolveKeyProvider).not.toHaveBeenCalled();
	});
});
import { resolveKeyProvider } from "@cloudflare/workers-auth";
