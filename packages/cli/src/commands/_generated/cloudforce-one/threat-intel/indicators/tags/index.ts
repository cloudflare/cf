import $list from "./list.js";
/**
 * tags command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tags",
	describe: "Operations for threat-intel.indicators.tags",

	routes: {
		list: $list,
	},
});

export default command;
