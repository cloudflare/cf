import $list from "./list.js";
/**
 * maintenance-runs command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "maintenance-runs",
	describe: "History of maintenance runs performed on tables",

	routes: {
		list: $list,
	},
});

export default command;
