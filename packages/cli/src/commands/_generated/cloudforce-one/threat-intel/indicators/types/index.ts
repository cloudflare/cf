import $create from "./create.js";
import $list from "./list.js";
/**
 * types command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "types",
	describe: "Operations for threat-intel.indicators.types",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
