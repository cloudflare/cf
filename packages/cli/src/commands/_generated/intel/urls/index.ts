import $get from "./get.js";
/**
 * urls command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "urls",
	describe: "URL intelligence operations",

	routes: {
		get: $get,
	},
});

export default command;
