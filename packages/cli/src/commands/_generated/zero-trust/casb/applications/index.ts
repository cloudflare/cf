import $authmethods from "./auth-methods/index.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * applications command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "applications",
	describe: "Operations for casb.applications",

	routes: {
		get: $get,
		list: $list,
		"auth-methods": $authmethods,
	},
});

export default command;
