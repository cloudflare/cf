import $get from "./get.js";
/**
 * dnssec command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dnssec",
	describe: "Operations for as112.top.locations.dnssec",

	routes: {
		get: $get,
	},
});

export default command;
