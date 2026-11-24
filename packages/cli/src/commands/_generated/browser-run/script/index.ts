import $create from "./create.js";
import $execute from "./execute.js";
/**
 * script command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "script",
	describe: "Operations for script",

	routes: {
		create: $create,
		execute: $execute,
	},
});

export default command;
