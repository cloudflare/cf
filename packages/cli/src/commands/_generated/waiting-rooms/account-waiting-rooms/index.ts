import $list from "./list.js";
/**
 * account-waiting-rooms command group
 * @generated from apis/overlays/waiting-rooms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-waiting-rooms",
	describe: "Account-scoped waiting room listing",

	routes: {
		list: $list,
	},
});

export default command;
