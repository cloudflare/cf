import { bindings, defineConfig, exports } from "cf/config";

export default defineConfig({
	worker: {
		name: "cf-factory",
		compatibilityDate: "2026-10-01",
		compatibilityFlags: ["nodejs_compat"],
		env: {
			AI: bindings.ai(),
			FLUE_ISSUE_TRIAGE_AGENT: bindings.durableObject({
				worker: "cf-factory",
				exportName: "FlueIssueTriageAgent",
			}),
			GITHUB_APP_ID: bindings.secret(),
			GITHUB_APP_PRIVATE_KEY: bindings.secret(),
			GITHUB_WEBHOOK_SECRET: bindings.secret(),
		},
		exports: {
			FlueIssueTriageAgent: exports.durableObject({
				storage: "sqlite",
			}),
		},
	},
});
