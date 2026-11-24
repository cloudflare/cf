import $list from "./list.js";
/**
 * available-alerts command group
 * @generated from apis/overlays/alerting.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "available-alerts",
	describe: "Operations for available-alerts",

	routes: {
		list: $list,
	},
});

export default command;
