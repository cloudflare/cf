import { cloudflare } from "@cloudflare/vite-plugin";
import { flue, flueWorkerConfig } from "@flue/vite";
import { defineConfig } from "vite";

const configureFlue = flueWorkerConfig();

export default defineConfig({
	plugins: [
		flue({
			providers: ["cloudflare"],
		}),
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
