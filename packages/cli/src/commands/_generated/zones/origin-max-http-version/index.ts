import $edit from "./edit.js";
import $get from "./get.js";
/**
 * origin-max-http-version command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin-max-http-version",
	describe: "Origin Max Http Version operations",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
