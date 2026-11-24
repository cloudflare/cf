import $cleanup from "./cleanup.js";
import $list from "./list.js";
/**
 * connections command group
 * @generated from apis/overlays/tunnels.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connections",
	describe: "Operations for connections",

	routes: {
		cleanup: $cleanup,
		list: $list,
	},
});

export default command;
