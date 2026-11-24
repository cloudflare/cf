import $ases from "./ases/index.js";
import $attacks from "./attacks.js";
import $locations from "./locations/index.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for attacks.layer7.top",

	routes: {
		attacks: $attacks,
		ases: $ases,
		locations: $locations,
	},
});

export default command;
