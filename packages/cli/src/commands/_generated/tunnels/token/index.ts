import $get from "./get.js";
/**
 * token command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "token",
	describe: "Operations for token",

	routes: {
		get: $get,
	},
});

export default command;
