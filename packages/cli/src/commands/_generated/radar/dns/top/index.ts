import $ases from "./ases.js";
import $locations from "./locations.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for dns.top",

	routes: {
		ases: $ases,
		locations: $locations,
	},
});

export default command;
