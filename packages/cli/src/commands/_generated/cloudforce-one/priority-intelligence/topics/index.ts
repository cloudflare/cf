import $list from "./list.js";
/**
 * topics command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "topics",
	describe: "Operations for priority-intelligence.topics",

	routes: {
		list: $list,
	},
});

export default command;
