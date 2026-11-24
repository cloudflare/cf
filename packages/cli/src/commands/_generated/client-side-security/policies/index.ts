import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * policies command group
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "policies",
	describe:
		"Content Security Policies that control which scripts and connections are allowed on your pages",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
