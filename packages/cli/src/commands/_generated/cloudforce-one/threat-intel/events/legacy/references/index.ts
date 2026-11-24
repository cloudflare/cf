import $create from "./create.js";
import $delete from "./delete.js";
/**
 * references command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "references",
	describe: "Operations for threat-intel.events.legacy.references",

	routes: {
		create: $create,
		delete: $delete,
	},
});

export default command;
