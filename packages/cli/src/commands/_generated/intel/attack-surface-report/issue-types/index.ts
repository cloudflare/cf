import $get from "./get.js";
/**
 * issue-types command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "issue-types",
	describe: "Operations for attack-surface-report.issue-types",

	routes: {
		get: $get,
	},
});

export default command;
