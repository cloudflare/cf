import $get from "./get.js";
import $list from "./list.js";
/**
 * categories command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "categories",
	describe: "Browse the categories used to classify applications",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
