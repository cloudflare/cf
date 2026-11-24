import $create from "./create.js";
/**
 * miscategorizations command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "miscategorizations",
	describe: "Report and track domain miscategorization corrections",

	routes: {
		create: $create,
	},
});

export default command;
