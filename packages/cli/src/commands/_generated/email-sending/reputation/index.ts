import $get from "./get.js";
/**
 * reputation command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reputation",
	describe: "Operations for reputation",

	routes: {
		get: $get,
	},
});

export default command;
