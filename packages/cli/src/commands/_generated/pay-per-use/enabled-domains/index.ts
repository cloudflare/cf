import $list from "./list.js";
/**
 * enabled-domains command group
 * @generated from apis/overlays/pay-per-use.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "enabled-domains",
	describe: "Operations for enabled-domains",

	routes: {
		list: $list,
	},
});

export default command;
