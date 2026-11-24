import $list from "./list.js";
/**
 * messages command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "messages",
	describe: "Operations for bulk-actions.messages",

	routes: {
		list: $list,
	},
});

export default command;
