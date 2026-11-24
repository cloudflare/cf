import $get from "./get.js";
/**
 * list command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "list",
	describe: "Operations for list",

	routes: {
		get: $get,
	},
});

export default command;
