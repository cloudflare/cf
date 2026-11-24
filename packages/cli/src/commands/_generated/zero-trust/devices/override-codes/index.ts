import $create from "./create.js";
/**
 * override-codes command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "override-codes",
	describe: "Operations for devices.override-codes",

	routes: {
		create: $create,
	},
});

export default command;
