import $get from "./get.js";
/**
 * health command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "health",
	describe: "View the current health of an origin pool",

	routes: {
		get: $get,
	},
});

export default command;
