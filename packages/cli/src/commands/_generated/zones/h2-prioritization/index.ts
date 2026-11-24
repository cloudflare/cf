import $edit from "./edit.js";
import $get from "./get.js";
/**
 * h2-prioritization command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "h2-prioritization",
	describe: "Operations for h2-prioritization",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
