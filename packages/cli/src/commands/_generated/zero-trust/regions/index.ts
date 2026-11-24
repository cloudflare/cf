import $list from "./list.js";
/**
 * regions command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "regions",
	describe: "Operations for regions",

	routes: {
		list: $list,
	},
});

export default command;
