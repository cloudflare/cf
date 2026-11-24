import $get from "./get.js";
import $list from "./list.js";
/**
 * jit-requests command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jit-requests",
	describe: "Operations for access.logs.jit-requests",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
