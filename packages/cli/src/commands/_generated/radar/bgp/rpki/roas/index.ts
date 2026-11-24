import $timeseries from "./timeseries.js";
/**
 * roas command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "roas",
	describe: "Operations for bgp.rpki.roas",

	routes: {
		timeseries: $timeseries,
	},
});

export default command;
