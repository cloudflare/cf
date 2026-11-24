import $edit from "./edit.js";
import $get from "./get.js";
/**
 * total-tls command group
 * @generated from apis/overlays/acm.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "total-tls",
	describe: "Operations for total-tls",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
