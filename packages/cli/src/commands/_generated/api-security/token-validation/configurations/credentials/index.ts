import $edit from "./edit.js";
import $update from "./update.js";
/**
 * credentials command group
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "credentials",
	describe: "Operations for token-validation.configurations.credentials",

	routes: {
		edit: $edit,
		update: $update,
	},
});

export default command;
