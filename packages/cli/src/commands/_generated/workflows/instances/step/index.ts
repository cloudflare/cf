import $get from "./get.js";
/**
 * step command group
 * @generated from apis/overlays/workflows.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "step",
	describe: "Operations for instances.step",

	routes: {
		get: $get,
	},
});

export default command;
