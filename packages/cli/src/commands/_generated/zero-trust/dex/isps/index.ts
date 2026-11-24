import $list from "./list.js";
/**
 * isps command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "isps",
	describe: "Operations for dex.isps",

	routes: {
		list: $list,
	},
});

export default command;
