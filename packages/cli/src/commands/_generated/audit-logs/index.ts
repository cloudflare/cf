import $list from "./list.js";
/**
 * audit-logs command
 * @generated from apis/overlays/audit-logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit-logs",
	describe: "audit-logs",

	routes: {
		list: $list,
	},
});

export default command;
