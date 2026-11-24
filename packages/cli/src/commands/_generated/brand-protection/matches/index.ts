import $bulkdismiss from "./bulk-dismiss.js";
import $get from "./get.js";
/**
 * matches command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "matches",
	describe: "Operations for matches",

	routes: {
		"bulk-dismiss": $bulkdismiss,
		get: $get,
	},
});

export default command;
