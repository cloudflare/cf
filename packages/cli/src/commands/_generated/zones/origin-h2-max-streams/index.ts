import $edit from "./edit.js";
import $get from "./get.js";
/**
 * origin-h2-max-streams command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin-h2-max-streams",
	describe: "Origin H2 Max Streams operations",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
