import $edit from "./edit.js";
import $get from "./get.js";
import $nameserversets from "./nameserver-sets/index.js";
/**
 * account command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account",
	describe: "Operations for settings.account",

	routes: {
		edit: $edit,
		get: $get,
		"nameserver-sets": $nameserversets,
	},
});

export default command;
