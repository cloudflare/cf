import $get from "./get.js";
import $list from "./list.js";
/**
 * cookies command group
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cookies",
	describe:
		"Cookies set by your pages with classification and same-site attribute tracking",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
