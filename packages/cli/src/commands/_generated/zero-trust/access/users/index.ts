import $activesessions from "./active-sessions/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $failedlogins from "./failed-logins/index.js";
import $get from "./get.js";
import $lastseenidentity from "./last-seen-identity/index.js";
import $list from "./list.js";
import $revoke from "./revoke.js";
import $update from "./update.js";
/**
 * users command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "users",
	describe: "Operations for access.users",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		revoke: $revoke,
		update: $update,
		"active-sessions": $activesessions,
		"failed-logins": $failedlogins,
		"last-seen-identity": $lastseenidentity,
	},
});

export default command;
