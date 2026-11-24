import $get from "./get.js";
/**
 * tls-single command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tls-single",
	describe: "Operations for hostnames.settings.tls-single",

	routes: {
		get: $get,
	},
});

export default command;
