import { defineConfig } from "vite-plus";
import base from "./vite.config.js";

export default defineConfig({
	resolve: base.resolve,
	test: {
		...base.test,
		env: { TZ: "UTC", CI: "1", CF_SEND_TELEMETRY: "0" },
		include: ["src/__tests__/regression/shards/*.test.ts"],
		exclude: [],
		// Each fork owns its cwd, MSW interceptor, auth state and snapshot files.
		// CI runs these files as GitHub Actions shards; see regression.yml.
		maxWorkers: 6,
		fileParallelism: true,
		server: {
			deps: {
				inline: [
					"@cloudflare/workers-utils",
					"@cloudflare/workers-auth",
					"@cloudflare/containers-shared",
					"@cloudflare/deploy-helpers",
				],
			},
		},
	},
});
