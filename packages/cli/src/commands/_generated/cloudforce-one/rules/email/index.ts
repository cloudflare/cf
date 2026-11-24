import $approvals from "./approvals/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $schema from "./schema/index.js";
import $test from "./test.js";
import $update from "./update.js";
import $validate from "./validate.js";
/**
 * email command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "email",
	describe: "Email rule operations",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		test: $test,
		update: $update,
		validate: $validate,
		approvals: $approvals,
		schema: $schema,
	},
});

export default command;
