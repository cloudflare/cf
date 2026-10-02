import { describe, expect, it, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => ({
	readBuildOutput: vi.fn(),
}));

vi.mock("@cloudflare/build-output-utils", () => ({
	readBuildOutput: mocks.readBuildOutput,
}));

const { runPreviewDeploy } = await import("../../commands/previews/deploy.js");

describe("cf previews deploy validation", () => {
	it("rejects non-Preview Build Output", async () => {
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: { buildContext: { isPreview: false } },
			workers: { default: {} },
		});

		await expect(
			runPreviewDeploy({
				"preview-name": "feature",
				prebuilt: true,
			} as Parameters<typeof runPreviewDeploy>[0])
		).rejects.toThrow("Build Output was not created by a Preview build.");
	});

	it.each([
		{
			buildContext: { isPreview: true },
			expected:
				'The Build Output does not record which mode it was created with, but this command requested mode "staging". Rebuild with "--mode staging" before deploying.',
		},
		{
			buildContext: { isPreview: true, mode: "production" },
			expected:
				'The Build Output was created with mode "production", but this command requested mode "staging". To use the existing Build Output, rerun with "--mode production". To deploy in staging mode, rebuild with "--mode staging" before deploying.',
		},
	])("rejects $expected", async ({ buildContext, expected }) => {
		mocks.readBuildOutput.mockResolvedValue({
			rootConfig: { buildContext },
			workers: { default: {} },
		});

		await expect(
			runPreviewDeploy({
				"preview-name": "feature",
				mode: "staging",
				prebuilt: true,
			} as Parameters<typeof runPreviewDeploy>[0])
		).rejects.toThrow(expected);
	});
});
