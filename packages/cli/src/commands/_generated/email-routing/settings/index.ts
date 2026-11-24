import $edit from "./edit.js";
import $get from "./get.js";
import $replace from "./replace.js";
/**
 * settings command group
 * @generated from apis/overlays/email-routing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "settings",
	describe: "Inspect and update Email Routing settings",

	routes: {
		edit: $edit,
		get: $get,
		replace: $replace,
	},
});

export default command;
