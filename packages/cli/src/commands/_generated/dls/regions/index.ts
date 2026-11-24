import $get from "./get.js";
import $list from "./list.js";
/**
 * regions command group
 * @generated from apis/overlays/dls.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regions",
	describe: "Operations for regions",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
