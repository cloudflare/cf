import $get from "./get.js";
import $list from "./list.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locations",
	describe: "Operations for entities.locations",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
