import $issuetypes from "./issue-types/index.js";
/**
 * attack-surface-report command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "attack-surface-report",
	describe:
		"Attack surface intelligence — exposed assets, vulnerabilities, and infrastructure mapping",

	routes: {
		"issue-types": $issuetypes,
	},
});

export default command;
