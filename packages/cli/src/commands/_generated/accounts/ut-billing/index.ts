import $edit from "./edit.js";
import $get from "./get.js";
/**
 * ut-billing command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ut-billing",
	describe: "Operations for ut-billing",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
