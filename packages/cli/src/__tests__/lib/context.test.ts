import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import {
	getAccountId,
	getComplianceRegion,
	getWorkerName,
	getZoneId,
	resolveAccountIdSilent,
} from "../../lib/context.js";
import { applyCloudflareDotEnv } from "../../lib/dotenv.js";
import { MissingCredentialsError } from "../../lib/errors.js";
import { setTemporaryAccountRequested } from "../../lib/oauth/index.js";
import {
	clearLoadedProjectSettings,
	setProjectConfigMode,
} from "../../lib/project-settings.js";
import type { ParsedSettings } from "@cloudflare/config";

const getOrSelectAccountIdMock = vi.hoisted(() => vi.fn());
const requireAuthMock = vi.hoisted(() => vi.fn());
const getActiveAccountIdMock = vi.hoisted(() => vi.fn());
const fetchAllAccountsMock = vi.hoisted(() => vi.fn());
const getAPITokenMock = vi.hoisted(() => vi.fn());

vi.mock("@cloudflare/workers-auth/cf", () => ({
	createCfAuth: () => ({
		getOrSelectAccountId: getOrSelectAccountIdMock,
		requireAuth: requireAuthMock,
		setTemporaryAllowed: vi.fn(),
		requireApiToken: () => ({ apiToken: "temporary-token" }),
		getActiveAccountId: getActiveAccountIdMock,
		fetchAllAccounts: fetchAllAccountsMock,
		getAPIToken: getAPITokenMock,
	}),
	createCfProfileStore: vi.fn(),
	validateScopeKeys: vi.fn(),
}));

function writeProjectSettings(settings: ParsedSettings): void {
	writeFileSync(
		join(process.cwd(), "cloudflare.config.ts"),
		`export default ${JSON.stringify(settings)};`
	);
}

describe("context", () => {
	runInTempDir();

	beforeEach(() => {
		vi.restoreAllMocks();
		getOrSelectAccountIdMock.mockReset();
		requireAuthMock.mockReset();
		setTemporaryAccountRequested(false);
		getActiveAccountIdMock.mockReset();
		fetchAllAccountsMock.mockReset();
		fetchAllAccountsMock.mockResolvedValue([]);
		getAPITokenMock.mockReset();
		clearLoadedProjectSettings();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_ZONE_ID", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
	});

	describe("getAccountId", () => {
		it.each([undefined, { apiToken: "expired-stored-token" }])(
			"classifies legacy auth errors by credential state (%j)",
			async (credentials) => {
				vi.stubEnv("CI", "true");
				getAPITokenMock.mockReturnValue(credentials);
				const error = Object.assign(new Error("Auth wording changed"), {
					telemetryMessage: "cfetch auth login required",
				});
				getOrSelectAccountIdMock.mockRejectedValue(error);
				if (credentials) {
					await expect(getAccountId()).rejects.toBe(error);
				} else {
					await expect(getAccountId()).rejects.toBeInstanceOf(
						MissingCredentialsError
					);
				}
			}
		);

		it("loads account id from cloudflare.config.ts settings", async () => {
			writeProjectSettings({ accountId: "settings-acct" });
			getOrSelectAccountIdMock.mockResolvedValue("settings-acct");

			await expect(getAccountId()).resolves.toBe("settings-acct");
			expect(getOrSelectAccountIdMock).toHaveBeenCalledWith({
				account_id: "settings-acct",
				compliance_region: "public",
			});
		});

		it("delegates unresolved account selection to workers-auth", async () => {
			getOrSelectAccountIdMock.mockResolvedValue("account-1");

			await expect(getAccountId()).resolves.toBe("account-1");
			expect(getOrSelectAccountIdMock).toHaveBeenCalledWith({
				account_id: undefined,
				compliance_region: "public",
			});
		});

		it("uses a temporary account instead of configured accounts", async () => {
			writeProjectSettings({ accountId: "settings-acct" });
			setTemporaryAccountRequested(true);
			requireAuthMock.mockResolvedValue("temporary-account");

			await expect(resolveAccountIdSilent()).resolves.toBeUndefined();
			await expect(getAccountId()).resolves.toBe("temporary-account");
			expect(requireAuthMock).toHaveBeenCalledWith({
				compliance_region: "public",
			});
			expect(getOrSelectAccountIdMock).not.toHaveBeenCalled();
		});

		it("uses an explicit region without reading project settings", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default () => { throw new Error("Project config should not be reevaluated"); };`
			);
			getOrSelectAccountIdMock.mockResolvedValue("selected-account");

			await expect(
				getAccountId({
					skipProjectSettings: true,
					complianceRegion: "fedramp_high",
				})
			).resolves.toBe("selected-account");
			expect(getOrSelectAccountIdMock).toHaveBeenCalledWith({
				account_id: undefined,
				compliance_region: "fedramp_high",
			});
		});
	});

	describe("resolveAccountIdSilent", () => {
		it("returns the env account ID", async () => {
			vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", "env-acct");
			expect(await resolveAccountIdSilent()).toBe("env-acct");
		});

		it("loads the settings account ID when env is unset", async () => {
			writeProjectSettings({ accountId: "settings-acct" });
			expect(await resolveAccountIdSilent()).toBe("settings-acct");
		});

		it("falls back to the account selected for this invocation", async () => {
			getActiveAccountIdMock.mockReturnValue("selected-acct");
			expect(await resolveAccountIdSilent()).toBe("selected-acct");
		});

		it("returns undefined when nothing is configured", async () => {
			expect(await resolveAccountIdSilent()).toBeUndefined();
		});

		it("never reaches for the account list", async () => {
			await resolveAccountIdSilent();
			expect(fetchAllAccountsMock).not.toHaveBeenCalled();
		});
	});

	describe("getZoneId", () => {
		it("uses the global zone flag before the environment", async () => {
			vi.stubEnv("CLOUDFLARE_ZONE_ID", "env-zone");
			await expect(getZoneId({ zone: "flag-zone" })).resolves.toBe("flag-zone");
		});

		it("uses CLOUDFLARE_ZONE_ID when no zone is passed", async () => {
			vi.stubEnv("CLOUDFLARE_ZONE_ID", "env-zone");
			await expect(
				getZoneId(undefined, undefined, { quiet: true })
			).resolves.toBe("env-zone");
		});

		it("fails when no zone is configured", async () => {
			await expect(getZoneId()).rejects.toThrow("No zone specified");
		});
	});

	describe("getWorkerName", () => {
		it("returns the scriptName when present", async () => {
			await expect(getWorkerName({ scriptName: "my-worker" })).resolves.toBe(
				"my-worker"
			);
		});

		it("prefers the flag over cloudflare.config.ts", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default { worker: { name: "from-config", compatibilityDate: "2025-01-01" } };`
			);
			await expect(getWorkerName({ scriptName: "flag" })).resolves.toBe("flag");
		});

		it.each([
			`throw new Error("config should not load");`,
			`export default { worker: { name: 42 } };`,
		])(
			"does not load invalid config when --worker is provided: %s",
			async (source) => {
				writeFileSync(join(process.cwd(), "cloudflare.config.ts"), source);
				await expect(getWorkerName({ scriptName: "flag" })).resolves.toBe(
					"flag"
				);
			}
		);

		it("falls back to worker.name from cloudflare.config.ts and says so", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default { worker: { name: "from-config", compatibilityDate: "2025-01-01" } };`
			);
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			await expect(getWorkerName({})).resolves.toBe("from-config");
			expect(error).toHaveBeenCalledWith(
				"Using Worker: from-config (from cloudflare.config.ts)"
			);
		});

		it("stays quiet with --quiet", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default { worker: { name: "from-config", compatibilityDate: "2025-01-01" } };`
			);
			const error = vi.spyOn(console, "error").mockImplementation(() => {});
			await expect(getWorkerName({ quiet: true })).resolves.toBe("from-config");
			expect(error).not.toHaveBeenCalled();
		});

		it("finds the Worker from a subdirectory", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default { worker: { name: "from-parent", compatibilityDate: "2025-01-01" } };`
			);
			const nested = join(process.cwd(), "one", "two");
			mkdirSync(nested, { recursive: true });
			process.chdir(nested);

			await expect(getWorkerName({ quiet: true })).resolves.toBe("from-parent");
		});

		it("honours --mode in function-form config and Worker definitions", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default ({ mode }) => ({
	worker: ({ mode: workerMode }) => ({
		name: mode + "-" + workerMode,
		compatibilityDate: "2025-01-01",
	}),
});`
			);
			setProjectConfigMode("staging");

			await expect(getWorkerName({ quiet: true })).resolves.toBe(
				"staging-staging"
			);
		});

		it("reports a missing name when config defines no Worker", async () => {
			writeProjectSettings({ accountId: "settings-acct" });
			await expect(getWorkerName()).rejects.toThrow(
				/Required Worker name missing.*worker.name/
			);
		});

		it("surfaces validation errors even when worker.name is present", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`export default { worker: { name: "from-config", compatibilityDate: 42 } };`
			);
			await expect(getWorkerName()).rejects.toThrow(
				/Invalid cloudflare.config.ts:[\s\S]*worker.compatibilityDate/
			);
		});

		it.each([
			`throw new Error("broken config import");`,
			`export default () => { throw new Error("broken config import"); };`,
		])("surfaces config load errors: %s", async (source) => {
			writeFileSync(join(process.cwd(), "cloudflare.config.ts"), source);
			await expect(getWorkerName()).rejects.toThrow(
				/Could not load cloudflare.config.ts.*broken config import/
			);
		});

		it("throws a helpful error when missing", async () => {
			await expect(getWorkerName({})).rejects.toThrow(
				/Required Worker name missing/
			);
			await expect(getWorkerName()).rejects.toThrow(/--worker/);
		});
	});

	describe("getComplianceRegion", () => {
		it("defaults to public when nothing is configured", async () => {
			await expect(getComplianceRegion()).resolves.toBe("public");
		});

		it("reads the value from cloudflare.config.ts settings", async () => {
			writeProjectSettings({ complianceRegion: "fedramp-high" });

			await expect(getComplianceRegion()).resolves.toBe("fedramp_high");
		});

		it("reads the environment before loading project settings", async () => {
			writeFileSync(
				join(process.cwd(), "cloudflare.config.ts"),
				`throw new Error("project config should not be loaded");`
			);
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");
			await expect(getComplianceRegion()).resolves.toBe("fedramp_high");
		});

		it("throws on an invalid value", async () => {
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "invalid");
			await expect(getComplianceRegion()).rejects.toThrow(
				'Invalid compliance region "invalid" from CLOUDFLARE_COMPLIANCE_REGION. Valid values are: public, fedramp_high'
			);
		});

		it("names the dotenv file that set an invalid value", async () => {
			writeFileSync(".env.staging", "CLOUDFLARE_COMPLIANCE_REGION=invalid");
			const restore = await applyCloudflareDotEnv({ mode: "staging" });
			try {
				await expect(getComplianceRegion()).rejects.toThrow(
					'Invalid compliance region "invalid" from CLOUDFLARE_COMPLIANCE_REGION in .env.staging. Valid values are: public, fedramp_high'
				);
			} finally {
				restore();
			}
		});
	});
});
