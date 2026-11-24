import $create from "./create.js";
/**
 * direct-upload command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "direct-upload",
	describe: "Operations for videos.direct-upload",

	routes: {
		create: $create,
	},
});

export default command;
