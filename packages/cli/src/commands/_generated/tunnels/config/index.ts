import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * config command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config",
	describe: "Operations for config",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
