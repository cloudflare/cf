import $getaccount from "./get-account.js";
/**
 * usage-stats command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "usage-stats",
	describe: "Operations for usage-stats",

	routes: {
		"get-account": $getaccount,
	},
});

export default command;
