import $create from "./create.js";
/**
 * providers command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "providers",
	describe: "Operations for indicator-feeds.providers",

	routes: {
		create: $create,
	},
});

export default command;
