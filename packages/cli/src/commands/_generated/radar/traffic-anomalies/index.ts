import $get from "./get.js";
import $list from "./list.js";
import $locations from "./locations/index.js";
/**
 * traffic-anomalies command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "traffic-anomalies",
	describe:
		"Detected traffic anomalies and unusual patterns in Internet traffic flows",

	routes: {
		get: $get,
		list: $list,
		locations: $locations,
	},
});

export default command;
