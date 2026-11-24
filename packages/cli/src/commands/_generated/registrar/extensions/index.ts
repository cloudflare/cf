import $get from "./get.js";
import $list from "./list.js";
/**
 * extensions command group
 * @generated from apis/overlays/registrar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "extensions",
	describe: "Operations for extensions",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
