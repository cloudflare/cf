import $timeseries from "./timeseries.js";
/**
 * upstreams command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "upstreams",
	describe: "Operations for bgp.routes.upstreams",

	routes: {
		timeseries: $timeseries,
	},
});

export default command;
