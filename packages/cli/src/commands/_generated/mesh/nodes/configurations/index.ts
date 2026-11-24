import $get from "./get.js";
import $update from "./update.js";
/**
 * configurations command group
 * @generated from apis/overlays/mesh.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "configurations",
	describe: "Operations for nodes.configurations",

	routes: {
		get: $get,
		update: $update,
	},
});

export default command;
