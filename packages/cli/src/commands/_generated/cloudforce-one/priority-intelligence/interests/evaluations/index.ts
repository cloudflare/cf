import $create from "./create.js";
import $get from "./get.js";
/**
 * evaluations command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "evaluations",
	describe: "Operations for priority-intelligence.interests.evaluations",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
