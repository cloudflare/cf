import $list from "./list.js";
/**
 * attackers command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "attackers",
	describe: "Operations for threat-intel.events.attackers",

	routes: {
		list: $list,
	},
});

export default command;
