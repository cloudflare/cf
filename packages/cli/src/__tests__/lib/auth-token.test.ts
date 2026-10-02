import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAuthToken } from "../../lib/auth-token.js";
import { CliExit } from "../../lib/cli-exit.js";

const { getOAuthToken } = vi.hoisted(() => ({ getOAuthToken: vi.fn() }));
vi.mock("../../lib/oauth/index.js", () => ({ getValidToken: getOAuthToken }));

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
		await expect(getAuthToken()).rejects.toThrow("cf auth login");
	});

	it("preserves OAuth cancellation", async () => {
		const error = new CliExit(130, { cancelled: true });
		getOAuthToken.mockRejectedValue(error);
		await expect(getAuthToken()).rejects.toBe(error);
	});
});
