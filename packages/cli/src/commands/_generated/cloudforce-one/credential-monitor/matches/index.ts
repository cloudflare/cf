import $list from "./list.js";
/**
 * matches command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "matches",
	describe: "Operations for credential-monitor.matches",

	routes: {
		list: $list,
	},
});

export default command;
