import $changelog from "./changelog/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $evaluate from "./evaluate.js";
import $get from "./get.js";
import $list from "./list.js";
import $patch from "./patch.js";
import $update from "./update.js";
/**
 * flags command group
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "flags",
	describe: "Operations for apps.flags",

	routes: {
		create: $create,
		delete: $delete,
		evaluate: $evaluate,
		get: $get,
		list: $list,
		patch: $patch,
		update: $update,
		changelog: $changelog,
	},
});

export default command;
