import { cloudflare } from "@cloudflare/vite-plugin";
import { flue, flueWorkerConfig } from "@flue/vite";
import { defineConfig } from "vite-plus";

const fluePlugins = flue({ providers: ["cloudflare"] });
const configureFlue = flueWorkerConfig();

export default defineConfig({
	run: {
		tasks: {
			"task:dev": {
				command: "cf dev",
				dependsOn: [
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
			"task:build": {
				command: "cf build",
				dependsOn: [
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
			"task:check:type": {
				command: "tsgo --noEmit",
				dependsOn: ["task:build"],
				cache: false,
			},
			"task:test": {
				command: "vp test run --config vitest.config.ts",
				dependsOn: ["task:build"],
				cache: false,
			},
		},
	},
	plugins: [
		fluePlugins,
		cloudflare({
			config: (config) => {
				// Flue's customizer uses Wrangler fields; cf's Vite v2 uses camelCase.
				const flueConfig = {
					compatibility_date: config.compatibilityDate,
					compatibility_flags: config.compatibilityFlags,
					main: config.entrypoint,
				};
				configureFlue(flueConfig);
				return {
					entrypoint: flueConfig.main,
				};
			},
		}),
	],
});
