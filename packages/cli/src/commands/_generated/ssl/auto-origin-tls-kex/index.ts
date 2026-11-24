import $edit from "./edit.js";
import $get from "./get.js";
/**
 * auto-origin-tls-kex command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "auto-origin-tls-kex",
	describe: "Operations for auto-origin-tls-kex",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
