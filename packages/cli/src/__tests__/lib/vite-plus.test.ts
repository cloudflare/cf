import { NpmPackageManager } from "@cloudflare/workers-utils";
import { describe, expect, it } from "vite-plus/test";
import { maybeApplyVitePlusCommandOverrides } from "../../lib/vite-plus.js";
import type { AutoConfigDetails } from "@cloudflare/autoconfig";

function details(runner = "npx"): AutoConfigDetails {
	return {
		projectPath: "/project",
		configured: true,
		workerName: "worker",
		packageManager: { ...NpmPackageManager, npx: runner },
		packageJson: { devDependencies: { "vite-plus": "1.4.0" } },
		devCommand: `${runner} vite`,
		buildCommand: `${runner} vite build`,
	};
}

describe("Vite+ project commands", () => {
	it.each(["npx", "pnpm", "yarn", "bunx"])(
		"uses local vp with %s",
		(runner) => {
			expect(maybeApplyVitePlusCommandOverrides(details(runner))).toMatchObject(
				{
					devCommand: `${runner} vp dev`,
					buildCommand: `${runner} vp build`,
				}
			);
		}
	);
	it("supports an explicit Vite dev command", () => {
		expect(
			maybeApplyVitePlusCommandOverrides({
				...details(),
				devCommand: "npx vite dev",
			}).devCommand
		).toBe("npx vp dev");
	});
	it("preserves framework commands and custom build steps", () => {
		const project = {
			...details(),
			devCommand: "npx astro dev",
			buildCommand: "npm run build",
		};
		expect(maybeApplyVitePlusCommandOverrides(project)).toEqual(project);
	});
	it("preserves projects without Vite+", () => {
		const project = { ...details(), packageJson: {} };
		expect(maybeApplyVitePlusCommandOverrides(project)).toBe(project);
	});
});
