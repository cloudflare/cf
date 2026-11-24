import $create from "./create.js";
import $delete from "./delete.js";
import $email from "./email/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $test from "./test.js";
import $update from "./update.js";
/**
 * policies command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "policies",
	describe: "Operations for policies",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		test: $test,
		update: $update,
		email: $email,
	},
});

export default command;
