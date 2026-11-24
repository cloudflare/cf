import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * subscriptions command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subscriptions",
	describe: "View and manage zone-level plan subscriptions owned by your user",

	routes: {
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
