import { cloudflare } from "@cloudflare/vite-plugin";
import { flue, flueWorkerConfig } from "@flue/vite";
import { defineConfig } from "vite";

const fluePlugins = flue({ providers: ["cloudflare"] });
const configureFlue = flueWorkerConfig();

export default defineConfig({
	build: {
		rolldownOptions: {
			onLog(level, log, defaultHandler) {
				// Flue injects agent registration before bundling.
				if (
					level === "warn" &&
					log.code === "MODULE_LEVEL_DIRECTIVE" &&
					log.message.includes('"use agent"')
				) {
					return;
				}
				defaultHandler(level, log);
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
