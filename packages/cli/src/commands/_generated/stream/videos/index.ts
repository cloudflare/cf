import $audiotracks from "./audio-tracks/index.js";
import $captions from "./captions/index.js";
import $clip from "./clip.js";
import $copy from "./copy.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $directupload from "./direct-upload/index.js";
import $downloads from "./downloads/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $list from "./list.js";
import $token from "./token/index.js";
/**
 * videos command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "videos",
	describe: "Aggregate video storage usage statistics for the account",

	routes: {
		clip: $clip,
		copy: $copy,
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"audio-tracks": $audiotracks,
		captions: $captions,
		"direct-upload": $directupload,
		downloads: $downloads,
		token: $token,
	},
});

export default command;
