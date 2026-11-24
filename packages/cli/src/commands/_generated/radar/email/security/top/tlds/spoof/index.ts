import $get from "./get.js";
/**
 * spoof command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "spoof",
	describe: "Operations for email.security.top.tlds.spoof",

	routes: {
		get: $get,
	},
});

export default command;
