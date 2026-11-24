import $decide from "./decide.js";
import $list from "./list.js";
/**
 * proposals command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "proposals",
	describe: "Operations for proposals",

	routes: {
		decide: $decide,
		list: $list,
	},
});

export default command;
