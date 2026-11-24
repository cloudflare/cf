import $account from "./account/index.js";
/**
 * settings command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for settings",

	routes: {
		account: $account,
	},
});

export default command;
