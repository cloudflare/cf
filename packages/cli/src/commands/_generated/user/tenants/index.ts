import $list from "./list.js";
/**
 * tenants command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tenants",
	describe: "Tenants the user belongs to",

	routes: {
		list: $list,
	},
});

export default command;
