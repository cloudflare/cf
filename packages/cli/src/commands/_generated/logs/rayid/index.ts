import $get from "./get.js";
/**
 * rayid command group
 * @generated from apis/overlays/logs.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rayid",
	describe: "Operations for rayid",

	routes: {
		get: $get,
	},
});

export default command;
