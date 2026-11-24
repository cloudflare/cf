import $makereusable from "./make-reusable.js";
/**
 * policies command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "policies",
	describe: "Operations for access.applications.policies",

	routes: {
		"make-reusable": $makereusable,
	},
});

export default command;
