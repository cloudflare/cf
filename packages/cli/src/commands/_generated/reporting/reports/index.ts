import $get from "./get.js";
import $list from "./list.js";
/**
 * reports command group
 * @generated from apis/overlays/reporting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reports",
	describe: "Operations for reports",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
