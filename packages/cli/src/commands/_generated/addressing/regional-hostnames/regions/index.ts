import $list from "./list.js";
/**
 * regions command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regions",
	describe: "Operations for regional-hostnames.regions",

	routes: {
		list: $list,
	},
});

export default command;
