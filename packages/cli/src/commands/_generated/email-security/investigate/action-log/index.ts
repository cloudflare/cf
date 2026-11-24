import $list from "./list.js";
/**
 * action-log command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "action-log",
	describe: "Operations for investigate.action-log",

	routes: {
		list: $list,
	},
});

export default command;
