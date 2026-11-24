import $list from "./list.js";
/**
 * auth-methods command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "auth-methods",
	describe: "Operations for casb.applications.auth-methods",

	routes: {
		list: $list,
	},
});

export default command;
