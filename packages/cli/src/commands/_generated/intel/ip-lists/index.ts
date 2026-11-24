import $list from "./list.js";
/**
 * ip-lists command group
 * @generated from apis/overlays/intel.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ip-lists",
	describe: "Curated IP lists used for threat detection and policy enforcement",

	routes: {
		list: $list,
	},
});

export default command;
