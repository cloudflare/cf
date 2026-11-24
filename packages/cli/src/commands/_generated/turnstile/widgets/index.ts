import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $rotatesecret from "./rotate-secret.js";
import $update from "./update.js";
/**
 * widgets command group
 * @generated from apis/overlays/turnstile.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "widgets",
	describe:
		"Turnstile widget configurations — site keys, secret rotation, and challenge mode settings",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		"rotate-secret": $rotatesecret,
		update: $update,
	},
});

export default command;
