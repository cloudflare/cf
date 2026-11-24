import $list from "./list.js";
/**
 * history command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "history",
	describe: "Operations for billing.history",

	routes: {
		list: $list,
	},
});

export default command;
