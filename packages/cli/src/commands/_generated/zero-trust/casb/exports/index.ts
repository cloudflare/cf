import $get from "./get.js";
import $list from "./list.js";
/**
 * exports command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "exports",
	describe: "Operations for casb.exports",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
