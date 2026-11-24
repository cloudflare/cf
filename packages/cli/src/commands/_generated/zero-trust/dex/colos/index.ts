import $list from "./list.js";
/**
 * colos command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "colos",
	describe: "Operations for dex.colos",

	routes: {
		list: $list,
	},
});

export default command;
