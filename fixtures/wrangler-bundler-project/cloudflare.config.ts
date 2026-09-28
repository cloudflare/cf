import { defineConfig } from "wrangler/experimental-config";
import * as entrypoint from "./src/worker.ts" with { type: "cf-worker" };

export default defineConfig((ctx) => ({
	worker: {
		name: "wrangler-project-fixture",
		entrypoint,
		compatibilityDate: "2026-05-18",
		env: {
			MY_VAR: {
				type: "text",
				value: ctx.mode === "test" ? "Test var" : "Default var",
			},
		},
	},
}));
