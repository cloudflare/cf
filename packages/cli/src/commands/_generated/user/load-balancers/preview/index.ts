import $get from "./get.js";
/**
 * preview command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "preview",
	describe: "Retrieve the results of a monitor or pool health preview",

	routes: {
		get: $get,
	},
});

export default command;
