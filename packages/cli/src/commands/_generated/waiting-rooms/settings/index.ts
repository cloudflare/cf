import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * settings command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Zone-level waiting room defaults and cookie configuration",

	routes: {
		edit: $edit,
		get: $get,
		update: $update,
	},
});

export default command;
