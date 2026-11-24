import $currents from "./currents/index.js";
/**
 * aggregates command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "aggregates",
	describe: "Operations for analytics.aggregates",

	routes: {
		currents: $currents,
	},
});

export default command;
