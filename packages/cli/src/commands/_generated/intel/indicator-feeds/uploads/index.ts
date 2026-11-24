import $get from "./get.js";
/**
 * uploads command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "uploads",
	describe: "Operations for indicator-feeds.uploads",

	routes: {
		get: $get,
	},
});

export default command;
