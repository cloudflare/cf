import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * tokens command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe:
		"Tokens that authorize publishers and subscribers to connect to a relay",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
