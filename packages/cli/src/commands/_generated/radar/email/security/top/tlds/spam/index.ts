import $get from "./get.js";
/**
 * spam command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "spam",
	describe: "Operations for email.security.top.tlds.spam",

	routes: {
		get: $get,
	},
});

export default command;
