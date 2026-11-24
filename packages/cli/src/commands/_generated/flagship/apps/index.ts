import $create from "./create.js";
import $definitions from "./definitions/index.js";
import $delete from "./delete.js";
import $evaluate from "./evaluate/index.js";
import $flags from "./flags/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * apps command group
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "apps",
	describe: "Operations for apps",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		definitions: $definitions,
		evaluate: $evaluate,
		flags: $flags,
	},
});

export default command;
