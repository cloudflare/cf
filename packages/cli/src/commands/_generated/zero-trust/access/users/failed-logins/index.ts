import $list from "./list.js";
/**
 * failed-logins command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "failed-logins",
	describe: "Operations for access.users.failed-logins",

	routes: {
		list: $list,
	},
});

export default command;
