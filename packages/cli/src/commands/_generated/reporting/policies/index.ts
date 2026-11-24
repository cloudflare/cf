import $get from "./get.js";
import $list from "./list.js";
/**
 * policies command group
 * @generated from apis/overlays/reporting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "policies",
	describe: "Operations for policies",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
