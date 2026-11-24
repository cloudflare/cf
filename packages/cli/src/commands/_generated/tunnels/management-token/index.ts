import $create from "./create.js";
/**
 * management-token command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "management-token",
	describe: "Operations for management-token",

	routes: {
		create: $create,
	},
});

export default command;
