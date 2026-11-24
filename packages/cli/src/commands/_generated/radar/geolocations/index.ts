import $get from "./get.js";
import $list from "./list.js";
/**
 * geolocations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "geolocations",
	describe: "Geographic location metadata used for regional traffic analysis",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
