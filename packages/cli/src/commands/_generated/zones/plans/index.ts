import $get from "./get.js";
import $list from "./list.js";
/**
 * plans command group
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "plans",
	describe: "Operations for plans",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
