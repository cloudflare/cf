import $list from "./list.js";
/**
 * indicators command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "indicators",
	describe: "Operations for threat-signals.indicators",

	routes: {
		list: $list,
	},
});

export default command;
