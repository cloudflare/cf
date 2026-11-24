import $create from "./create.js";
/**
 * validate command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "validate",
	describe: "Operations for prefixes.validate",

	routes: {
		create: $create,
	},
});

export default command;
