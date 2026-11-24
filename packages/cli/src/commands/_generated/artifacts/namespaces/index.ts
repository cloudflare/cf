import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $repos from "./repos/index.js";
import $tokens from "./tokens/index.js";
/**
 * namespaces command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "namespaces",
	describe: "Operations for namespaces",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		repos: $repos,
		tokens: $tokens,
	},
});

export default command;
