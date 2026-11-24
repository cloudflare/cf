import $create from "./create.js";
import $list from "./list.js";
/**
 * relationships command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "relationships",
	describe: "Operations for threat-intel.events.relationships",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
