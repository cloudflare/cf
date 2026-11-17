import { existsSync, readFileSync } from "node:fs";
import {
	resetCredentialStorageState,
	setKeyProviderFactoryForTesting,
	setLinuxSecretToolRunner,
} from "@cloudflare/workers-auth";
import {
	getAuthConfigFilePath,
	getEncryptedAuthConfigFilePath,
	readUserPreferences,
	writeAuthConfigFile,
} from "@cloudflare/workers-auth/cf";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";
import { mockOutputStreams } from "../../helpers/capture-output.js";
import { setupMsw } from "../../helpers/msw.js";
import { runCf } from "../../helpers/run-cf.js";

describe("cf auth login default keyring storage", () => {
	runInTempDir();
	setupMsw();
	const std = mockOutputStreams();
	const keys = new Map<string, Uint8Array>();
	let backendAvailable = true;

	beforeEach(() => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", undefined);
		vi.stubEnv("CLOUDFLARE_AUTH_USE_KEYRING", undefined);
		resetCredentialStorageState();
		backendAvailable = true;
		keys.clear();
		setKeyProviderFactoryForTesting((_service, profile = "default") => ({
			setKey: (key) => {
				if (!backendAvailable) {
					throw new Error("Secret service is unavailable");
				}
				keys.set(profile, key);
			},
			getKey: () => keys.get(profile),
			deleteKey: () => {
				keys.delete(profile);
			},
			describe: () => "test OS keyring",
		}));
		writeAuthConfigFile({
			oauth_token: "stored-oauth-token",
			expiration_time: "2999-01-01T00:00:00.000Z",
		});
	});

	afterEach(() => {
		setKeyProviderFactoryForTesting(undefined);
		setLinuxSecretToolRunner(undefined);
		resetCredentialStorageState();
	});

	it.each([true, false])(
		"checks the Linux secret service after secret-tool exits 2 (service available: %s)",
		async (serviceAvailable) => {
			const platform = vi
				.spyOn(process, "platform", "get")
				.mockReturnValue("linux");
			setKeyProviderFactoryForTesting(undefined);
			const secrets = new Map<string, string>();
			const runner = vi.fn((args: string[], options?: { input?: string }) => {
				let status = 0;
				let stdout = "";
				const account = args.at(-1) ?? "";
				if (args[0] === "--version") {
					status = 2;
				} else if (args[0] === "store") {
					if (serviceAvailable) {
						secrets.set(account, options?.input ?? "");
					} else {
						status = 1;
					}
				} else if (args[0] === "lookup") {
					stdout = secrets.get(account) ?? "";
					status = secrets.has(account) ? 0 : 1;
				} else if (args[0] === "clear") {
					secrets.delete(account);
				}
				return {
					pid: 1,
					status,
					signal: null,
					stdout,
					stderr: "",
					output: [null, stdout, ""],
				};
			});
			setLinuxSecretToolRunner(runner);

			try {
				await runCf(["auth", "login"]);

				expect(runner).toHaveBeenCalledWith(["--version"]);
				expect(readUserPreferences().keyring_enabled).toBe(
					serviceAvailable ? true : undefined
				);
				expect(existsSync(getAuthConfigFilePath())).toBe(!serviceAvailable);
				expect(existsSync(getEncryptedAuthConfigFilePath())).toBe(
					serviceAvailable
				);
				expect(std.err.includes("OAuth credentials will be stored")).toBe(
					!serviceAvailable
				);
			} finally {
				platform.mockRestore();
			}
		}
	);

	it("migrates existing credentials, removes plaintext, and leaves no probe key", async () => {
		await runCf(["auth", "login"]);

		expect(readUserPreferences().keyring_enabled).toBe(true);
		expect(existsSync(getAuthConfigFilePath())).toBe(false);
		expect(
			readFileSync(getEncryptedAuthConfigFilePath(), "utf8")
		).not.toContain("stored-oauth-token");
		expect([...keys.keys()]).toEqual(["default"]);
		expect(std.out).toBe("");
		expect(std.err).toContain("Migrated credentials");
		expect(std.err).toContain("You are already logged in");

		std.getAndClearErr();
		await runCf(["auth", "login"]);

		expect(std.err).not.toContain("Migrated credentials");
		expect(std.err).toContain("You are already logged in");
	});

	it("keeps plaintext usable in CI and migrates on a later login when the backend recovers", async () => {
		vi.stubEnv("CI", "true");
		backendAvailable = false;

		await runCf(["auth", "login", "--quiet"]);

		expect(readUserPreferences().keyring_enabled).toBeUndefined();
		expect(existsSync(getAuthConfigFilePath())).toBe(true);
		expect(existsSync(getEncryptedAuthConfigFilePath())).toBe(false);
		expect(keys.size).toBe(0);
		expect(std.getAndClearErr()).toContain("plaintext file");

		await runCf(["auth", "login", "--quiet"]);
		expect(std.getAndClearErr()).toBe("");

		backendAvailable = true;
		await runCf(["auth", "login"]);

		expect(readUserPreferences().keyring_enabled).toBe(true);
		expect(existsSync(getAuthConfigFilePath())).toBe(false);
		expect(existsSync(getEncryptedAuthConfigFilePath())).toBe(true);
		expect([...keys.keys()]).toEqual(["default"]);
		expect(std.err).toContain("You are already logged in");
	});
});
