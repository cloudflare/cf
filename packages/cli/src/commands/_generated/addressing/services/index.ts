import $list from "./list.js";
/**
 * services command group
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "services",
	describe: "Operations for services",

	routes: {
		list: $list,
	},
});

export default command;
