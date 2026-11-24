import $edit from "./edit.js";
import $get from "./get.js";
/**
 * settings command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Operations for dispatch-namespaces.scripts.settings",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
