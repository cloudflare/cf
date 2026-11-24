import $create from "./create.js";
import $list from "./list.js";
/**
 * feedback command group
 * @generated from apis/overlays/bot-management.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "feedback",
	describe: "Operations for feedback",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
