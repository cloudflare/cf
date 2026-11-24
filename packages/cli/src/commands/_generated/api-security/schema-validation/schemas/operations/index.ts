import $list from "./list.js";
/**
 * operations command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "operations",
	describe: "Operations for schema-validation.schemas.operations",

	routes: {
		list: $list,
	},
});

export default command;
