import $list from "./list.js";
/**
 * subnets command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subnets",
	describe: "Operations for asn.subnets",

	routes: {
		list: $list,
	},
});

export default command;
