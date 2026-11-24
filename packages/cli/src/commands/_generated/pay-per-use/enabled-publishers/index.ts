import $list from "./list.js";
/**
 * enabled-publishers command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "enabled-publishers",
	describe: "Operations for enabled-publishers",

	routes: {
		list: $list,
	},
});

export default command;
