import $list from "./list.js";
/**
 * leases command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "leases",
	describe: "Operations for leases",

	routes: {
		list: $list,
	},
});

export default command;
