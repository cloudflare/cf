import $get from "./get.js";
import $list from "./list.js";
/**
 * resource-types command group
 * @generated from apis/overlays/scim.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "resource-types",
	describe: "Resource Types operations",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
