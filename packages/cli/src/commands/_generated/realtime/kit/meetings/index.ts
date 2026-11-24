import $active from "./active/index.js";
import $create from "./create.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $livestream from "./livestream/index.js";
import $participants from "./participants/index.js";
import $replace from "./replace.js";
/**
 * meetings command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "meetings",
	describe: "Meetings, participants, access tokens, and meeting livestreams",

	routes: {
		create: $create,
		edit: $edit,
		get: $get,
		list: $list,
		replace: $replace,
		active: $active,
		livestream: $livestream,
		participants: $participants,
	},
});

export default command;
