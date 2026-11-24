import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * apps command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "apps",
	describe:
		"RealtimeKit applications that group meetings, sessions, and configuration",

	routes: {
		create: $create,
		edit: $edit,
		get: $get,
		list: $list,
	},
});

export default command;
