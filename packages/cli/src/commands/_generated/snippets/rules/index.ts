import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/snippets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe: "Operations for rules",

	routes: {
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
