import $list from "./list.js";
/**
 * hosts command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "hosts",
	describe: "Operations for schema-validation.schemas.hosts",

	routes: {
		list: $list,
	},
});

export default command;
