import $catalog from "./catalog/index.js";
import $list from "./list.js";
/**
 * target-industries command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "target-industries",
	describe: "Operations for threat-intel.events.target-industries",

	routes: {
		list: $list,
		catalog: $catalog,
	},
});

export default command;
