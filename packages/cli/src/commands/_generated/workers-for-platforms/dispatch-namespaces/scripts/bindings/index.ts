import $get from "./get.js";
/**
 * bindings command group
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bindings",
	describe: "Operations for dispatch-namespaces.scripts.bindings",

	routes: {
		get: $get,
	},
});

export default command;
