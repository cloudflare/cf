import $list from "./list.js";
import $start from "./start.js";
/**
 * scans command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "scans",
	describe: "Operations for scans",

	routes: {
		list: $list,
		start: $start,
	},
});

export default command;
