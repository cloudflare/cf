import $get from "./get.js";
/**
 * tls-version command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tls-version",
	describe: "Operations for http.top.ases.tls-version",

	routes: {
		get: $get,
	},
});

export default command;
