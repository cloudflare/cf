import $list from "./list.js";
/**
 * reports command group
 * @generated from apis/overlays/email-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reports",
	describe: "Operations for phishguard.reports",

	routes: {
		list: $list,
	},
});

export default command;
