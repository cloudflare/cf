import $get from "./get.js";
import $list from "./list.js";
/**
 * schemas command group
 * @generated from apis/overlays/scim.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schemas",
	describe: "Schemas operations",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
