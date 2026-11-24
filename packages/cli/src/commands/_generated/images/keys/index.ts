import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * keys command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "keys",
	describe: "Manage signing keys for generating private image URLs",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
