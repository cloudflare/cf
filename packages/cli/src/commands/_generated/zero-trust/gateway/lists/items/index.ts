import $list from "./list.js";
/**
 * items command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "items",
	describe: "Operations for gateway.lists.items",

	routes: {
		list: $list,
	},
});

export default command;
