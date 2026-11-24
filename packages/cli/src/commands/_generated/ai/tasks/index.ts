import $list from "./list.js";
/**
 * tasks command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tasks",
	describe: "Operations for tasks",

	routes: {
		list: $list,
	},
});

export default command;
