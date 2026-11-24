import $get from "./get.js";
import $list from "./list.js";
/**
 * scripts command group
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scripts",
	describe:
		"JavaScript files detected on your pages with change tracking and malicious code detection",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
