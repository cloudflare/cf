import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $validation from "./validation/index.js";
/**
 * domains command group
 * @generated from apis/overlays/pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "domains",
	describe: "Operations for domains",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		validation: $validation,
	},
});

export default command;
