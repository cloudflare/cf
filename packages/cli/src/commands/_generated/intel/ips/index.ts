import $get from "./get.js";
/**
 * ips command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ips",
	describe:
		"IP address intelligence — geolocation, risk assessment, and hosting provider details",

	routes: {
		get: $get,
	},
});

export default command;
