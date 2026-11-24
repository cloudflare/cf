import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $setdefault from "./set-default.js";
import $update from "./update.js";
/**
 * payment-methods command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "payment-methods",
	describe: "Operations for billing.payment-methods",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"set-default": $setdefault,
		update: $update,
	},
});

export default command;
