import $list from "./list.js";
/**
 * dns command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns",
	describe:
		"Passive DNS data showing historical DNS resolution records for domains",

	routes: {
		list: $list,
	},
});

export default command;
