import $language from "./language/index.js";
import $list from "./list.js";
/**
 * captions command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "captions",
	describe: "Operations for videos.captions",

	routes: {
		list: $list,
		language: $language,
	},
});

export default command;
