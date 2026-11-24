import $create from "./create.js";
import $get from "./get.js";
/**
 * health command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "health",
	describe:
		"View current pool health or preview pool health with a monitor configuration",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
