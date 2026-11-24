import $get from "./get.js";
/**
 * currents command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "currents",
	describe: "Operations for analytics.aggregates.currents",

	routes: {
		get: $get,
	},
});

export default command;
