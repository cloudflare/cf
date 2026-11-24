import $list from "./list.js";
/**
 * keys command group
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "keys",
	describe: "Operations for keys",

	routes: {
		list: $list,
	},
});

export default command;
