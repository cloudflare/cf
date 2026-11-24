import $list from "./list.js";
/**
 * transformations command group
 * @generated from apis/overlays/accounts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "transformations",
	describe: "Operations for transformations",

	routes: {
		list: $list,
	},
});

export default command;
