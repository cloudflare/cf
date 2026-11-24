import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
/**
 * keys command group
 * @generated from apis/overlays/stream.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "keys",
	describe:
		"Signing keys used to generate short-lived signed URLs for private video playback",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
	},
});

export default command;
