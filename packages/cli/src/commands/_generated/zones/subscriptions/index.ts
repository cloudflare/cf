import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subscriptions",
	describe: "Operations for subscriptions",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
