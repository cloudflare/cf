import $create from "./create.js";
/**
 * rollouts command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rollouts",
	describe: "Manage rollouts for scheduler-backed applications",

	routes: {
		create: $create,
	},
});

export default command;
