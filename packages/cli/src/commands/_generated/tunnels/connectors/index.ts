import $get from "./get.js";
/**
 * connectors command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connectors",
	describe: "Operations for connectors",

	routes: {
		get: $get,
	},
});

export default command;
