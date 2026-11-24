import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $replace from "./replace.js";
import $tokens from "./tokens/index.js";
/**
 * participants command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "participants",
	describe: "Participants in RealtimeKit meetings",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		replace: $replace,
		tokens: $tokens,
	},
});

export default command;
