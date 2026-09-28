import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { runInTempDir } from "@cloudflare/workers-utils/test-helpers";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	getAccountId,
	getComplianceRegion,
	getWorkerName,
	getZoneId,
	resolveAccountIdSilent,
} from "../../lib/context.js";
import { clearLoadedProjectSettings } from "../../lib/project-settings.js";
import type { ParsedInputSettingsConfig } from "@cloudflare/config";

const getOrSelectAccountIdMock = vi.hoisted(() => vi.fn());
const getActiveAccountIdMock = vi.hoisted(() => vi.fn());
const fetchAllAccountsMock = vi.hoisted(() => vi.fn());

vi.mock("@cloudflare/workers-auth/cf", () => ({
	createCfAuth: () => ({
		getOrSelectAccountId: getOrSelectAccountIdMock,
		getActiveAccountId: getActiveAccountIdMock,
		fetchAllAccounts: fetchAllAccountsMock,
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
		getActiveAccountIdMock.mockReset();
		fetchAllAccountsMock.mockReset();
		fetchAllAccountsMock.mockResolvedValue([]);
		clearLoadedProjectSettings();
		vi.stubEnv("CLOUDFLARE_ACCOUNT_ID", undefined);
		vi.stubEnv("CLOUDFLARE_ZONE_ID", undefined);
		vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", undefined);
	});

	describe("getAccountId", () => {
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

		it("prioritises the legacy env representation", async () => {
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "fedramp_high");
			await expect(getComplianceRegion()).resolves.toBe("fedramp_high");
		});

		it("warns when the environment overrides project settings", async () => {
			const warn = vi
				.spyOn(console, "warn")
				.mockImplementation(() => undefined);
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "public");
			writeProjectSettings({ complianceRegion: "fedramp-high" });

			await expect(getComplianceRegion()).resolves.toBe("public");
			await expect(getComplianceRegion()).resolves.toBe("public");

			expect(warn).toHaveBeenCalledOnce();
			expect(warn).toHaveBeenCalledWith(
				'The compliance region was resolved to "public" from the `CLOUDFLARE_COMPLIANCE_REGION` environment variable, which takes precedence over the configured value "fedramp-high" in `cloudflare.config.ts`.'
			);
		});

		it("throws on an invalid value", async () => {
			vi.stubEnv("CLOUDFLARE_COMPLIANCE_REGION", "invalid");
			await expect(getComplianceRegion()).rejects.toThrow(
				/Invalid compliance region/
			);
		});
	});
});
