import $edit from "./edit.js";
import $get from "./get.js";
/**
 * speed-brain command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "speed-brain",
	describe: "Speed Brain operations",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
