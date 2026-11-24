import $list from "./list.js";
/**
 * resources command group
 * @generated from apis/overlays/tags.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "resources",
	describe: "Operations for resources",

	routes: {
		list: $list,
	},
});

export default command;
