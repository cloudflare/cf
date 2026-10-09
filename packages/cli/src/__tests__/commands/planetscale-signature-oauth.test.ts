import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vite-plus/test";

const mocks = vi.hoisted(() => ({
	getAuthFromEnv: vi.fn<() => { apiToken: string } | undefined>(),
	isNonInteractiveOrCI: vi.fn(() => false),
	login: vi.fn<(options: { scopes: string[] }) => Promise<boolean>>(),
	readAuthCredentials: vi.fn<() => { scopes?: string[] } | undefined>(),
	validateScopeKeys: vi.fn<(scopes: string[]) => boolean>(),
}));

vi.mock("#lib/auth.js", () => ({
	login: mocks.login,
	readAuthCredentials: mocks.readAuthCredentials,
}));
vi.mock("#lib/interactive.js", () => ({
	isNonInteractiveOrCI: mocks.isNonInteractiveOrCI,
}));
vi.mock("@cloudflare/workers-auth", () => ({
	getAuthFromEnv: mocks.getAuthFromEnv,
}));
vi.mock("@cloudflare/workers-auth/cf", () => ({
	DefaultScopeKeys: ["account.read", "query-cache.read"],
	validateScopeKeys: mocks.validateScopeKeys,
}));

const { ensurePlanetScaleSetupScope } =
	await import("#commands/hyperdrive/integration/planetscale/signature/oauth.js");
const REQUIRED_SCOPE = "hyperdrive-planetscale:setup";
const BROWSER_SECRET_ENV_VARS = [
	"CLOUDFLARE_ACCESS_CLIENT_SECRET",
	"WRANGLER_CF_AUTHORIZATION_TOKEN",
] as const;

describe("PlanetScale signature OAuth", () => {
	beforeEach(() => {
		for (const envVar of BROWSER_SECRET_ENV_VARS) {
			vi.stubEnv(envVar, undefined);
		}
		mocks.getAuthFromEnv.mockReset().mockReturnValue(undefined);
		mocks.isNonInteractiveOrCI.mockReset().mockReturnValue(false);
		mocks.readAuthCredentials.mockReset().mockReturnValue(undefined);
		mocks.login.mockReset().mockImplementation(async ({ scopes }) => {
			mocks.readAuthCredentials.mockReturnValue({ scopes });
			return true;
		});
		mocks.validateScopeKeys
			.mockReset()
			.mockImplementation(
				(scopes) =>
					!scopes.some((scope) =>
						["offline_access", "removed.scope"].includes(scope)
					)
			);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it("leaves API tokens unchanged", async () => {
		mocks.getAuthFromEnv.mockReturnValue({ apiToken: "api-token" });

		await ensurePlanetScaleSetupScope();

		expect(mocks.readAuthCredentials).not.toHaveBeenCalled();
		expect(mocks.login).not.toHaveBeenCalled();
	});

	it("keeps OAuth credentials that already include the scope", async () => {
		mocks.readAuthCredentials.mockReturnValue({
			scopes: ["account.read", REQUIRED_SCOPE],
		});

		await ensurePlanetScaleSetupScope();

		expect(mocks.login).not.toHaveBeenCalled();
	});

	it("preserves requestable scopes and drops stale scope metadata", async () => {
		vi.stubEnv("CLOUDFLARE_ACCESS_CLIENT_SECRET", "secret");
		mocks.readAuthCredentials.mockReturnValue({
			scopes: ["dns.read", "offline_access", "removed.scope"],
		});

		await ensurePlanetScaleSetupScope(true);

		expect(mocks.login).toHaveBeenCalledWith({
			browser: false,
			scopes: ["dns.read", REQUIRED_SCOPE],
		});
	});

	it("uses defaults when stored scope metadata is unavailable", async () => {
		await ensurePlanetScaleSetupScope(true);

		expect(mocks.login).toHaveBeenCalledWith({
			browser: true,
			scopes: ["account.read", "query-cache.read", REQUIRED_SCOPE],
		});
	});

	it("fails with guidance in a non-interactive process", async () => {
		mocks.isNonInteractiveOrCI.mockReturnValue(true);

		await expect(ensurePlanetScaleSetupScope()).rejects.toThrow(
			"Run this command in an interactive terminal"
		);
		expect(mocks.login).not.toHaveBeenCalled();
	});

	it.each([
		{
			condition: "an API token appears before OAuth starts",
			loginResult: false,
			message: "CLOUDFLARE_API_TOKEN became active",
		},
		{
			condition: "authorization does not grant the scope",
			loginResult: true,
			message: "without granting the required OAuth scope",
		},
	])("fails if $condition", async ({ loginResult, message }) => {
		mocks.login.mockResolvedValue(loginResult);

		await expect(ensurePlanetScaleSetupScope()).rejects.toThrow(message);
	});
});
