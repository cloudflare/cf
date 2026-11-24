import $get from "./get.js";
/**
 * previews command group
 * @generated from apis/overlays/load-balancers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "previews",
	describe:
		"Preview the result of a health check monitor configuration before applying it",

	routes: {
		get: $get,
	},
});

export default command;
