import $get from "./get.js";
/**
 * report command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "report",
	describe: "Operations for analytics.zones.report",

	routes: {
		get: $get,
	},
});

export default command;
