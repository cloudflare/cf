import $tlds from "./tlds/index.js";
/**
 * top command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "top",
	describe: "Operations for email.security.top",

	routes: {
		tlds: $tlds,
	},
});

export default command;
