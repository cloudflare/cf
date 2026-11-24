import $list from "./list.js";
/**
 * actors command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "actors",
	describe: "Operations for threat-intel.tags.actors",

	routes: {
		list: $list,
	},
});

export default command;
