import $get from "./get.js";
/**
 * vtt command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "vtt",
	describe: "Operations for videos.captions.language.vtt",

	routes: {
		get: $get,
	},
});

export default command;
