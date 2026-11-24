import $get from "./get.js";
/**
 * account command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account",
	describe: "Operations for usage.account",

	routes: {
		get: $get,
	},
});

export default command;
