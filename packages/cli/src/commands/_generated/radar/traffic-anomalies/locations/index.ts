import $get from "./get.js";
/**
 * locations command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "locations",
	describe: "Operations for traffic-anomalies.locations",

	routes: {
		get: $get,
	},
});

export default command;
