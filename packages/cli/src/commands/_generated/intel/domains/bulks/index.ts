import $get from "./get.js";
/**
 * bulks command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bulks",
	describe: "Operations for domains.bulks",

	routes: {
		get: $get,
	},
});

export default command;
