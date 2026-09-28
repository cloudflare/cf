import { defineConfig } from "cf/config";
import * as entrypoint from "./src/worker" with { type: "cf-worker" };

export default defineConfig((ctx) => ({
	worker: {
		name: "vite-plugin-fixture",
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
