import $list from "./list.js";
/**
 * audit-logs command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "audit-logs",
	describe: "Operations for audit-logs",

	routes: {
		list: $list,
	},
});

export default command;
