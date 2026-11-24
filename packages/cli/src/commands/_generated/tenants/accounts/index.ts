import $list from "./list.js";
/**
 * accounts command group
 * @generated from apis/overlays/tenants.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "accounts",
	describe: "Accounts that belong to a tenant",

	routes: {
		list: $list,
	},
});

export default command;
