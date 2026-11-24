import $edit from "./edit.js";
import $get from "./get.js";
import $update from "./update.js";
/**
 * configurations command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configurations",
	describe: "Operations for gateway.configurations",

	routes: {
		edit: $edit,
		get: $get,
		update: $update,
	},
});

export default command;
