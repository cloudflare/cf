import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $hosts from "./hosts/index.js";
import $list from "./list.js";
import $operations from "./operations/index.js";
import $setvalidation from "./set-validation.js";
/**
 * schemas command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schemas",
	describe: "Operations for schema-validation.schemas",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"set-validation": $setvalidation,
		hosts: $hosts,
		operations: $operations,
	},
});

export default command;
