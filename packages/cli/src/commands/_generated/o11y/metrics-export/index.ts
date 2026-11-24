import $list from "./list.js";
import $upsert from "./upsert.js";
/**
 * metrics-export command group
 * @generated from apis/overlays/o11y.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metrics-export",
	describe: "Operations for metrics-export",

	routes: {
		list: $list,
		upsert: $upsert,
	},
});

export default command;
