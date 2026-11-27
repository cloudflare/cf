import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { prepareProject } from "../../lib/autoconfig.js";
import type * as dialog from "../../lib/dialog.js";
import type { AutoConfigDetails } from "@cloudflare/autoconfig";

// Regression coverage for cloudflare/cf#801: a legacy Wrangler project whose
// migration is declined or unavailable must not fall back to framework setup,
// which detects it as a static site and discards its entrypoint and bindings.

const mocks = vi.hoisted(() => ({
	getDetailsForAutoConfig: vi.fn(),
	runAutoConfig: vi.fn(),
	migrateWranglerToCf: vi.fn(),
	interactiveAnswer: undefined as boolean | undefined,
}));

vi.mock("@cloudflare/autoconfig", () => ({
	AutoConfigDetectionError: class AutoConfigDetectionError extends Error {},
	getDetailsForAutoConfig: mocks.getDetailsForAutoConfig,
	runAutoConfig: mocks.runAutoConfig,
}));

vi.mock("@cloudflare/codemods", () => ({
	migrateWranglerToCf: mocks.migrateWranglerToCf,
}));

// Without an interactive answer, the real dialog runs: vitest has no TTY on
// stdin, so it behaves as in CI or for a piped agent.
vi.mock("../../lib/dialog.js", async (importOriginal) => {
	const actual = await importOriginal<typeof dialog>();
	return {
		...actual,
		confirm: (...args: Parameters<typeof actual.confirm>) =>
			mocks.interactiveAnswer === undefined
				? actual.confirm(...args)
				: Promise.resolve(mocks.interactiveAnswer),
	};
});

const staticDetails = {
	configured: false,
	projectPath: process.cwd(),
	workerName: "legacy-worker",
	framework: { id: "static", name: "Static" },
	outputDir: "public",
	packageManager: {},
} as unknown as AutoConfigDetails;

const legacyWranglerConfig = JSON.stringify({
	name: "legacy-worker",
	main: "src/index.ts",
	compatibility_date: "2025-01-01",
	assets: { directory: "./public" },
	kv_namespaces: [{ binding: "KV", id: "0123456789abcdef0123456789abcdef" }],
});

describe("project preparation for a legacy Wrangler project (#801)", () => {
	runInTempDir();

	afterEach(() => {
		vi.resetAllMocks();
		mocks.interactiveAnswer = undefined;
	});

	async function seedLegacyProject() {
		await seed({
			"wrangler.jsonc": legacyWranglerConfig,
			"src/index.ts":
				'export default { async fetch(req, env) { return new Response(await env.KV.get("x")); } };',
			"public/index.html": "<h1>hi</h1>",
			"package.json": JSON.stringify({
				name: "legacy-worker",
				devDependencies: { wrangler: "^4" },
			}),
		});
		mocks.getDetailsForAutoConfig.mockResolvedValue(staticDetails);
		mocks.runAutoConfig.mockResolvedValue({
			scripts: {},
			outputDir: "public",
		});
	}

	it("stops without framework setup when migration is declined in a terminal", async () => {
		await seedLegacyProject();
		mocks.interactiveAnswer = false;

		await expect(prepareProject(process.cwd())).rejects.toThrow(/cf migrate/);

		expect(mocks.migrateWranglerToCf).not.toHaveBeenCalled();
		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
	});

	it("stops without framework setup when migration cannot be offered (CI or piped agent)", async () => {
		await seedLegacyProject();

		await expect(prepareProject(process.cwd())).rejects.toThrow(/cf migrate/);

		expect(mocks.migrateWranglerToCf).not.toHaveBeenCalled();
		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
	});

	it("stops without framework setup during a dry run when migration is declined", async () => {
		await seedLegacyProject();
		mocks.interactiveAnswer = false;

		await expect(
			prepareProject(process.cwd(), { dryRun: true })
		).rejects.toThrow(/cf migrate/);

		expect(mocks.runAutoConfig).not.toHaveBeenCalled();
	});

	it("still runs framework setup for a project without a Wrangler config", async () => {
		await seed({ "public/index.html": "<h1>hi</h1>" });
		mocks.getDetailsForAutoConfig.mockResolvedValue(staticDetails);
		mocks.runAutoConfig.mockResolvedValue({ scripts: {}, outputDir: "public" });

		await expect(prepareProject(process.cwd())).resolves.toMatchObject({
			configuration: { outputDir: "public" },
		});
		expect(mocks.runAutoConfig).toHaveBeenCalledOnce();
	});
});
