import $list from "./list.js";
/**
 * updates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "updates",
	describe: "Operations for access.logs.scim.updates",

	routes: {
		list: $list,
	},
});

export default command;
