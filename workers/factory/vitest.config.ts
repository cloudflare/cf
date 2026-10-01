import { generateKeyPairSync } from "node:crypto";
import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			experimental: { newConfig: true },
			main: ".cloudflare/output/v0/workers/default/bundle/index.js",
			remoteBindings: false,
			miniflare: {
				durableObjects: {
					FLUE_ISSUE_TRIAGE_AGENT: {
						className: "FlueIssueTriageAgent",
						useSQLite: true,
					},
				},
				bindings: {
					GITHUB_APP_ID: "123",
					GITHUB_APP_PRIVATE_KEY: generateKeyPairSync("rsa", {
						modulusLength: 2048,
					})
						.privateKey.export({ format: "pem", type: "pkcs1" })
						.toString()
						.replace(/\n/g, "\\n"),
					GITHUB_WEBHOOK_SECRET: "test-webhook-secret",
				},
			},
		}),
	],
	test: {
		include: ["src/__tests__/**/*.test.ts"],
		mockReset: true,
		restoreMocks: true,
	},
});
