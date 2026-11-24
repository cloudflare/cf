import $edit from "./edit.js";
import $get from "./get.js";
/**
 * config command group
 * @generated from apis/overlays/images.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "config",
	describe: "Account-level Cloudflare Images settings",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
