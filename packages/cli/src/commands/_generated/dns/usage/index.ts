import $account from "./account/index.js";
/**
 * usage command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage",
	describe: "Operations for usage",

	routes: {
		account: $account,
	},
});

export default command;
