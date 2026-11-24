import $get from "./get.js";
/**
 * summaries command group
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "summaries",
	describe: "Operations for analytics.events.summaries",

	routes: {
		get: $get,
	},
});

export default command;
