import $fix from "./fix.js";
import $get from "./get.js";
import $status from "./status.js";
/**
 * dns command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe: "Operations for subdomains.dns",

	routes: {
		fix: $fix,
		get: $get,
		status: $status,
	},
});

export default command;
