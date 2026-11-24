import $canceldelayeddowngrade from "./cancel-delayed-downgrade.js";
import $createcancelreason from "./create-cancel-reason.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $getbyidentifier from "./get-by-identifier.js";
import $getcancelreason from "./get-cancel-reason.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subscriptions",
	describe: "View and manage plan subscriptions attached to this account",

	routes: {
		"cancel-delayed-downgrade": $canceldelayeddowngrade,
		create: $create,
		"create-cancel-reason": $createcancelreason,
		delete: $delete,
		get: $get,
		"get-by-identifier": $getbyidentifier,
		"get-cancel-reason": $getcancelreason,
		update: $update,
	},
});

export default command;
