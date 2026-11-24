import $delete from "./delete.js";
import $generate from "./generate.js";
import $get from "./get.js";
import $upload from "./upload.js";
import $vtt from "./vtt/index.js";
/**
 * language command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "language",
	describe: "Operations for videos.captions.language",

	routes: {
		delete: $delete,
		generate: $generate,
		get: $get,
		upload: $upload,
		vtt: $vtt,
	},
});

export default command;
