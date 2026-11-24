import $get from "./get.js";
/**
 * bulk-operations command group
 * @generated from apis/overlays/rules.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bulk-operations",
	describe: "Operations for lists.bulk-operations",

	routes: {
		get: $get,
	},
});

export default command;
