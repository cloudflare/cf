import $get from "./get.js";
/**
 * bytimes command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bytimes",
	describe: "Operations for analytics.events.bytimes",

	routes: {
		get: $get,
	},
});

export default command;
