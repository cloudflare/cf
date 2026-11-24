import $get from "./get.js";
/**
 * http-protocol command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "http-protocol",
	describe: "Operations for http.top.ases.http-protocol",

	routes: {
		get: $get,
	},
});

export default command;
