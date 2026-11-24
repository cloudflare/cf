import $list from "./list.js";
/**
 * access-requests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "access-requests",
	describe: "Operations for access.logs.access-requests",

	routes: {
		list: $list,
	},
});

export default command;
