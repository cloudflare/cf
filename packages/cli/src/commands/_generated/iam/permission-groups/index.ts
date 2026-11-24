import $get from "./get.js";
import $list from "./list.js";
/**
 * permission-groups command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "permission-groups",
	describe:
		"View the permission groups that can be assigned to API tokens and policies",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
