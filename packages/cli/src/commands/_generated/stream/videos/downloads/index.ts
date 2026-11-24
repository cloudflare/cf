import $create from "./create.js";
import $delete from "./delete.js";
/**
 * downloads command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "downloads",
	describe: "Operations for videos.downloads",

	routes: {
		create: $create,
		delete: $delete,
	},
});

export default command;
