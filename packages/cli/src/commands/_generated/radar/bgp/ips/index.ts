import $timeseries from "./timeseries.js";
import $top from "./top/index.js";
/**
 * ips command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ips",
	describe: "Operations for bgp.ips",

	routes: {
		timeseries: $timeseries,
		top: $top,
	},
});

export default command;
