import { writeFileSync } from "node:fs";
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
import { MissingCredentialsError } from "../../lib/errors.js";
import { setTemporaryAccountRequested } from "../../lib/oauth/index.js";
import { clearLoadedProjectSettings } from "../../lib/project-settings.js";
import type { ParsedInputSettingsConfig } from "@cloudflare/config";

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

function writeProjectSettings(settings: ParsedInputSettingsConfig): void {
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

		it("falls back to the profile's cached account", async () => {
			getActiveAccountIdMock.mockReturnValue("cached-acct");
			expect(await resolveAccountIdSilent()).toBe("cached-acct");
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
		it("returns the scriptName when present", () => {
			expect(getWorkerName({ scriptName: "my-worker" })).toBe("my-worker");
		});

		it("throws a helpful error when missing", () => {
			expect(() => getWorkerName({})).toThrow(/Required Worker name missing/);
			expect(() => getWorkerName()).toThrow(/--worker/);
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
				/Invalid compliance region/
			);
		});
	});
});
