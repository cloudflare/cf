import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $tokens from "./tokens/index.js";
import $update from "./update.js";
/**
 * relays command group
 * @generated from apis/overlays/realtime.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "relays",
	describe:
		"Relays are isolated MoQ scopes that carry media between publishers and subscribers",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
		tokens: $tokens,
	},
});

export default command;
