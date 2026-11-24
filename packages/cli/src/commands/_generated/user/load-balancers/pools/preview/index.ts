import $create from "./create.js";
/**
 * preview command group
 * @generated from apis/overlays/user.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "preview",
	describe:
		"Preview pool health with a monitor configuration before applying it",

	routes: {
		create: $create,
	},
});

export default command;
