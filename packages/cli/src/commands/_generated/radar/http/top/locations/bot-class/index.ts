import $get from "./get.js";
/**
 * bot-class command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bot-class",
	describe: "Operations for http.top.locations.bot-class",

	routes: {
		get: $get,
	},
});

export default command;
