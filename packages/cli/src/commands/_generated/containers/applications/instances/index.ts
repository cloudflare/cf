import $get from "./get.js";
import $list from "./list.js";
/**
 * instances command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "instances",
	describe: "Inspect Containers instances belonging to applications",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
