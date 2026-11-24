import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * fallback-origin command group
 * @generated from apis/overlays/custom-hostnames.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "fallback-origin",
	describe: "Operations for fallback-origin",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
