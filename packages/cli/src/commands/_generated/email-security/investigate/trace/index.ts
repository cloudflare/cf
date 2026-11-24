import $get from "./get.js";
/**
 * trace command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "trace",
	describe: "Operations for investigate.trace",

	routes: {
		get: $get,
	},
});

export default command;
