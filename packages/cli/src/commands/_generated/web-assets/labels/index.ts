import $list from "./list.js";
import $managed from "./managed/index.js";
import $user from "./user/index.js";
/**
 * labels command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "labels",
	describe: "Operations for labels",

	routes: {
		list: $list,
		managed: $managed,
		user: $user,
	},
});

export default command;
