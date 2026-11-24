import $grant from "./grant.js";
import $list from "./list.js";
import $revoke from "./revoke.js";
/**
 * permissions command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "permissions",
	describe: "Operations for indicator-feeds.permissions",

	routes: {
		grant: $grant,
		list: $list,
		revoke: $revoke,
	},
});

export default command;
