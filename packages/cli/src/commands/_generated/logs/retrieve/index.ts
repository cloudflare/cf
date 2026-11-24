import $get from "./get.js";
/**
 * retrieve command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "retrieve",
	describe: "Operations for retrieve",

	routes: {
		get: $get,
	},
});

export default command;
