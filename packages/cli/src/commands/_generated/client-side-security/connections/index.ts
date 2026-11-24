import $get from "./get.js";
import $list from "./list.js";
/**
 * connections command group
 * @generated from apis/overlays/client-side-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connections",
	describe:
		"Third-party connections made by scripts on your pages — track data exfiltration risks",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
