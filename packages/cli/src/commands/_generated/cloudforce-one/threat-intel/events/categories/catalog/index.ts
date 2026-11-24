import $list from "./list.js";
/**
 * catalog command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "catalog",
	describe: "Operations for threat-intel.events.categories.catalog",

	routes: {
		list: $list,
	},
});

export default command;
