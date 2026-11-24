import $create from "./create.js";
/**
 * previews command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "previews",
	describe:
		"Preview how a monitor configuration evaluates pool health before applying it",

	routes: {
		create: $create,
	},
});

export default command;
