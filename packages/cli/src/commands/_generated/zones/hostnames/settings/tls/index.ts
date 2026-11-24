import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * tls command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tls",
	describe: "Operations for hostnames.settings.tls",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
