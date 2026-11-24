import $list from "./list.js";
/**
 * countries command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "countries",
	describe: "Operations for threat-intel.events.countries",

	routes: {
		list: $list,
	},
});

export default command;
