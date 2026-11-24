import $get from "./get.js";
/**
 * malicious command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "malicious",
	describe: "Operations for email.security.top.tlds.malicious",

	routes: {
		get: $get,
	},
});

export default command;
