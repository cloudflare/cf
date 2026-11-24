import $get from "./get.js";
/**
 * edns command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "edns",
	describe: "Operations for as112.top.locations.edns",

	routes: {
		get: $get,
	},
});

export default command;
