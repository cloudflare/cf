import $get from "./get.js";
/**
 * profile command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "profile",
	describe: "Operations for billing.profile",

	routes: {
		get: $get,
	},
});

export default command;
