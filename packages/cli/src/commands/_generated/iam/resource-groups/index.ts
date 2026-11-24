import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * resource-groups command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "resource-groups",
	describe:
		"Define scopes that limit which account resources a policy or token can access",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
