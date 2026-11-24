import $locations from "./locations/index.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for as112.top",

	routes: {
		locations: $locations,
	},
});

export default command;
