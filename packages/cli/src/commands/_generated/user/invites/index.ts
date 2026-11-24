import $get from "./get.js";
import $list from "./list.js";
import $respond from "./respond.js";
/**
 * invites command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "invites",
	describe: "Operations for invites",

	routes: {
		get: $get,
		list: $list,
		respond: $respond,
	},
});

export default command;
