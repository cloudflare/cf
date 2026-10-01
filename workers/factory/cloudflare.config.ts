import { bindings, defineConfig, exports } from "cf/config";

const WORKER_NAME = "cf-factory";

export default defineConfig({
	worker: {
		compatibilityDate: "2026-10-01",
		env: {
			AI: bindings.ai(),
			FLUE_ISSUE_TRIAGE_AGENT: bindings.durableObject({
				exportName: "FlueIssueTriageAgent",
				worker: WORKER_NAME,
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
		name: WORKER_NAME,
		observability: {
			enabled: true,
			issues: {
				enabled: true,
			},
			logs: {
				enabled: true,
			},
			traces: {
				enabled: true,
			},
		},
		workersDev: true,
	},
});
