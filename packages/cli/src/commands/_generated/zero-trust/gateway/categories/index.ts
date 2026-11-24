import $list from "./list.js";
/**
 * categories command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "categories",
	describe: "Operations for gateway.categories",

	routes: {
		list: $list,
	},
});

export default command;
