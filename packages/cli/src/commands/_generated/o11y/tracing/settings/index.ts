import $delete from "./delete.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for tracing.settings",

	routes: {
		delete: $delete,
		get: $get,
		update: $update,
	},
});

export default command;
