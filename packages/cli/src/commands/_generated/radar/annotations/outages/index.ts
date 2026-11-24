import $list from "./list.js";
import $locations from "./locations.js";
/**
 * outages command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "outages",
	describe: "Operations for annotations.outages",

	routes: {
		list: $list,
		locations: $locations,
	},
});

export default command;
