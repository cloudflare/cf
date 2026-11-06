import { runInTempDir, seed } from "@cloudflare/workers-utils/test-helpers";
import { expect, it } from "vite-plus/test";
import { renderWorkerTemplate } from "../../commands/init/template.js";
import { analyzeProject } from "../../lib/autoconfig.js";

runInTempDir();

it("detects Vite+ commands using the installed autoconfig dependency", async () => {
	await seed({
		...renderWorkerTemplate({
			name: "my-worker",
			compatibilityDate: "2026-10-29",
			cfVersion: "0.1.0",
			packageManager: "npm",
		}),
		"package-lock.json": "{}",
	});
	const details = await analyzeProject(process.cwd(), { output: "silent" });
	expect(details).toMatchObject({
		configured: true,
		devCommand: "npx vp dev",
		buildCommand: "npx vp build",
	});
});

it.each([false, true])(
	"detects vinext commands with Vite+ enabled: %s",
	async (vitePlus) => {
		await seed({
			"package.json": JSON.stringify({
				dependencies: { next: "^16.0.0", vinext: "^0.0.1" },
				...(vitePlus && { devDependencies: { "vite-plus": "1.4.0" } }),
			}),
			"package-lock.json": "{}",
			"node_modules/next/package.json": JSON.stringify({
				name: "next",
				version: "16.0.0",
			}),
			"node_modules/vinext/package.json": JSON.stringify({
				name: "vinext",
				version: "0.0.1",
			}),
		});
		const details = await analyzeProject(process.cwd(), { output: "silent" });
		const command = vitePlus ? "vp" : "vite";
		expect(details).toMatchObject({
			configured: true,
			devCommand: `npx ${command} dev`,
			buildCommand: `npx ${command} build`,
		});
	}
);
