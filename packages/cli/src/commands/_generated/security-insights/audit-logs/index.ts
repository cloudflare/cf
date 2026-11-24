import $get from "./get.js";
import $list from "./list.js";
/**
 * audit-logs command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit-logs",
	describe: "Operations for audit-logs",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
