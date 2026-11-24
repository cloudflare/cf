import $get from "./get.js";
import $list from "./list.js";
/**
 * session command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "session",
	describe: "Operations for devtools.session",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
