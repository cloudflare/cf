import $copy from "./copy.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $list from "./list.js";
/**
 * audio-tracks command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audio-tracks",
	describe: "Operations for videos.audio-tracks",

	routes: {
		copy: $copy,
		delete: $delete,
		edit: $edit,
		list: $list,
	},
});

export default command;
