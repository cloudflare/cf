import $get from "./get.js";
/**
 * raw command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "raw",
	describe: "Operations for investigate.raw",

	routes: {
		get: $get,
	},
});

export default command;
