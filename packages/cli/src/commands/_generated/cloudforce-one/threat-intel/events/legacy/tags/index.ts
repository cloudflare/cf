import $create from "./create.js";
import $delete from "./delete.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "Operations for threat-intel.events.legacy.tags",

	routes: {
		create: $create,
		delete: $delete,
	},
});

export default command;
