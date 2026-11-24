import $list from "./list.js";
/**
 * metrics command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metrics",
	describe: "Operations for buckets.metrics",

	routes: {
		list: $list,
	},
});

export default command;
