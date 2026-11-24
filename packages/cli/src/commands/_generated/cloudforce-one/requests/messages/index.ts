import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * messages command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "messages",
	describe: "Operations for requests.messages",

	routes: {
		create: $create,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
