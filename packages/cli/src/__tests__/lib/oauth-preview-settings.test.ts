import { beforeEach, describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
	getComplianceRegion: vi.fn(),
	getOrSelectAccountId: vi.fn(),
}));

vi.mock("../../lib/context.js", () => ({
	getComplianceRegion: mocks.getComplianceRegion,
}));

vi.mock("@cloudflare/workers-auth/cf", () => ({
	createCfAuth: () => ({
		getOrSelectAccountId: mocks.getOrSelectAccountId,
	}),
	createCfProfileStore: vi.fn(),
	validateScopeKeys: vi.fn(),
}));

const { getOrSelectAccountId } = await import("../../lib/oauth/index.js");

describe("OAuth Preview settings", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("uses Preview compliance when selecting the Preview account", async () => {
		mocks.getComplianceRegion.mockResolvedValue("fedramp_high");
		mocks.getOrSelectAccountId.mockResolvedValue("preview-account");

		await expect(
			getOrSelectAccountId("preview-account", { isPreview: true })
		).resolves.toBe("preview-account");
		expect(mocks.getComplianceRegion).toHaveBeenCalledWith({
			isPreview: true,
		});
		expect(mocks.getOrSelectAccountId).toHaveBeenCalledWith({
			account_id: "preview-account",
			compliance_region: "fedramp_high",
		});
	});
});
