import $create from "./create.js";
import $get from "./get.js";
/**
 * shared-queries command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "shared-queries",
	describe: "Operations for shared-queries",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
