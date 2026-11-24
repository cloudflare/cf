import $bulkget from "./bulk-get.js";
import $get from "./get.js";
/**
 * robots command group
 * @generated from apis/overlays/ai-audit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "robots",
	describe: "Operations for robots",

	routes: {
		"bulk-get": $bulkget,
		get: $get,
	},
});

export default command;
