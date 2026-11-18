import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { getAuthToken } from "../../lib/auth-token.js";
import { CliExit } from "../../lib/cli-exit.js";
import { MissingCredentialsError } from "../../lib/errors.js";

const {
	getOAuthToken,
	isOAuthLoggedIn,
	getActiveProfile,
	profileExists,
	listProfiles,
} = vi.hoisted(() => ({
	getOAuthToken: vi.fn(),
	isOAuthLoggedIn: vi.fn(),
	getActiveProfile: vi.fn(() => "default"),
	profileExists: vi.fn(),
	listProfiles: vi.fn(),
}));
vi.mock("../../lib/oauth/index.js", () => ({
	getActiveProfile,
	getProfileStore: () => ({
		configs: {
			exists: profileExists,
			list: listProfiles,
		},
	}),
	getValidToken: getOAuthToken,
	isOAuthLoggedIn,
	isTemporaryAccountRequested: () => false,
}));

beforeEach(() => {
	for (const key of [
		"CLOUDFLARE_API_TOKEN",
		"CF_API_TOKEN",
		"CLOUDFLARE_API_KEY",
		"CLOUDFLARE_EMAIL",
	]) {
		vi.stubEnv(key, undefined);
	}
	getOAuthToken.mockReset();
	isOAuthLoggedIn.mockReset().mockReturnValue(false);
	getActiveProfile.mockReset().mockReturnValue("default");
	profileExists.mockReset().mockReturnValue(false);
	listProfiles.mockReset().mockReturnValue(["work"]);
});

describe("getAuthToken", () => {
	it("prefers an environment token without loading OAuth credentials", async () => {
		vi.stubEnv("CLOUDFLARE_API_TOKEN", "env-token");
		await expect(getAuthToken()).resolves.toBe("env-token");
		expect(getOAuthToken).not.toHaveBeenCalled();
	});

	it("returns the refreshed OAuth token", async () => {
		getOAuthToken.mockResolvedValue("oauth-token");
		await expect(getAuthToken()).resolves.toBe("oauth-token");
		expect(getOAuthToken).toHaveBeenCalledOnce();
	});

	it("ignores global API key credentials", async () => {
		vi.stubEnv("CLOUDFLARE_API_KEY", "global-key");
		vi.stubEnv("CLOUDFLARE_EMAIL", "user@example.com");
		getOAuthToken.mockResolvedValue("oauth-token");
		await expect(getAuthToken()).resolves.toBe("oauth-token");
	});

	it("explains how to authenticate when no token exists", async () => {
		getOAuthToken.mockResolvedValue(undefined);
		await expect(getAuthToken()).rejects.toBeInstanceOf(
			MissingCredentialsError
		);
		await expect(getAuthToken()).rejects.toThrow("cf auth login");
	});

	it("reports that a non-default profile was not found when it does not exist", async () => {
		getActiveProfile.mockReturnValue("staging");
		getOAuthToken.mockResolvedValue(undefined);
		await expect(getAuthToken()).rejects.toBeInstanceOf(
			MissingCredentialsError
		);
		await expect(getAuthToken()).rejects.toThrow(
			"Auth profile \"staging\" not found (available: work). Run 'cf auth create staging' to authenticate it."
		);
	});

	it("omits the available profiles when no profiles exist", async () => {
		getActiveProfile.mockReturnValue("staging");
		getOAuthToken.mockResolvedValue(undefined);
		listProfiles.mockReturnValue([]);
		await expect(getAuthToken()).rejects.toThrow(
			new MissingCredentialsError(
				"Auth profile \"staging\" not found. Run 'cf auth create staging' to authenticate it."
			)
		);
	});

	it("reports missing credentials when the non-default profile exists", async () => {
		getActiveProfile.mockReturnValue("staging");
		getOAuthToken.mockResolvedValue(undefined);
		profileExists.mockReturnValue(true);
		await expect(getAuthToken()).rejects.toBeInstanceOf(
			MissingCredentialsError
		);
		await expect(getAuthToken()).rejects.toThrow(
			"No authentication token found."
		);
	});

	it("does not classify a failed OAuth refresh as missing credentials", async () => {
		getOAuthToken.mockResolvedValue(undefined);
		isOAuthLoggedIn.mockReturnValue(true);
		await expect(getAuthToken()).rejects.not.toBeInstanceOf(
			MissingCredentialsError
		);
		await expect(getAuthToken()).rejects.toThrow("cf auth login");
	});

	it("preserves OAuth cancellation", async () => {
		const error = new CliExit(130, { cancelled: true });
		getOAuthToken.mockRejectedValue(error);
		await expect(getAuthToken()).rejects.toBe(error);
	});
});
