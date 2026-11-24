import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * groups command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "groups",
	describe: "Operations for identity-providers.scim.groups",

	routes: {
		delete: $delete,
		get: $get,
		list: $list,
	},
});

export default command;
