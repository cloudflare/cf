import $get from "./get.js";
import $update from "./update.js";
/**
 * bgp-settings command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bgp-settings",
	describe:
		"BGP settings for controlling default ASN and route redistribution on Magic Transit tunnels",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
