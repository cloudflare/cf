import $list from "./list.js";
/**
 * values command group
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "values",
	describe: "Operations for values",

	routes: {
		list: $list,
	},
});

export default command;
