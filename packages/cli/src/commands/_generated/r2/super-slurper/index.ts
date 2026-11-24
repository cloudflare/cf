import $connectivityprecheck from "./connectivity-precheck/index.js";
import $jobs from "./jobs/index.js";
/**
 * super-slurper command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "super-slurper",
	describe:
		"Migrate data from external S3-compatible storage into R2 buckets with resumable transfer jobs",

	routes: {
		"connectivity-precheck": $connectivityprecheck,
		jobs: $jobs,
	},
});

export default command;
