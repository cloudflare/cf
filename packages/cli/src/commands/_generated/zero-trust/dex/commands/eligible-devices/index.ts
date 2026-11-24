import $list from "./list.js";
/**
 * eligible-devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "eligible-devices",
	describe: "Operations for dex.commands.eligible-devices",

	routes: {
		list: $list,
	},
});

export default command;
