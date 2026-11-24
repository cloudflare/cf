import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $test from "./test.js";
import $update from "./update.js";
/**
 * providers command group
 * @generated from apis/overlays/ai-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "providers",
	describe: "Store and rotate upstream AI provider keys for a gateway",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		test: $test,
		update: $update,
	},
});

export default command;
