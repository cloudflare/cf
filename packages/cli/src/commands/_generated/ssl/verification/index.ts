import $edit from "./edit.js";
import $get from "./get.js";
/**
 * verification command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "verification",
	describe: "Operations for verification",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
