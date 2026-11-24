import $jobs from "./jobs/index.js";
/**
 * remediations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "remediations",
	describe: "Operations for casb.remediations",

	routes: {
		jobs: $jobs,
	},
});

export default command;
