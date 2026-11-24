import $create from "./create.js";
/**
 * token command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "token",
	describe: "Operations for videos.token",

	routes: {
		create: $create,
	},
});

export default command;
