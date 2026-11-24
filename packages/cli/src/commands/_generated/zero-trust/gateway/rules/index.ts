import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $listtenant from "./list-tenant.js";
import $list from "./list.js";
import $resetexpiration from "./reset-expiration.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Operations for gateway.rules",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"list-tenant": $listtenant,
		"reset-expiration": $resetexpiration,
		update: $update,
	},
});

export default command;
